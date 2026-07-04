import {
  PHOTO_MAX_BYTES,
  PHOTO_MAX_WIDTH_PX,
  computeAverageLuminance,
  validatePhotoQc,
  type PhotoQcResult,
} from "@veloxlane/photos";

export type PreparedPhoto = {
  blob: Blob;
  width: number;
  height: number;
  averageLuminance: number;
  contentHash: string;
  qc: PhotoQcResult;
};

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to read image."));
      element.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function convertHeicToJpeg(file: File): Promise<File> {
  if (
    !file.type.includes("heic") &&
    !file.name.toLowerCase().endsWith(".heic")
  ) {
    return file;
  }

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!blob) {
    throw new Error("Unable to convert HEIC photo.");
  }
  return new File([blob], file.name.replace(/\.heic$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress image."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function sampleLuminance(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): number {
  const { data } = context.getImageData(0, 0, width, height);
  const samples: number[] = [];

  for (let index = 0; index < data.length; index += 16) {
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    samples.push(0.2126 * red + 0.7152 * green + 0.0722 * blue);
  }

  return computeAverageLuminance(samples);
}

async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function preparePhotoForUpload(
  file: File,
  options?: { duplicateHashes?: readonly string[] },
): Promise<PreparedPhoto> {
  const normalizedFile = await convertHeicToJpeg(file);
  const image = await loadImageFromFile(normalizedFile);

  const scale = Math.min(1, PHOTO_MAX_WIDTH_PX / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare image.");
  }

  context.drawImage(image, 0, 0, width, height);
  const averageLuminance = sampleLuminance(context, width, height);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > PHOTO_MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  const contentHash = await hashBlob(blob);
  const duplicateInOtherSlot = options?.duplicateHashes?.includes(contentHash);

  const qc = validatePhotoQc({
    byteLength: blob.size,
    width,
    height,
    averageLuminance,
    duplicateInOtherSlot,
  });

  return {
    blob,
    width,
    height,
    averageLuminance,
    contentHash,
    qc,
  };
}
