import {
  PHOTO_MAX_ASPECT_RATIO,
  PHOTO_MAX_BYTES,
  PHOTO_MIN_ASPECT_RATIO,
  PHOTO_MIN_WIDTH_PX,
} from "./constants";

export type PhotoDimensions = {
  width: number;
  height: number;
};

export type PhotoQcRejectReason =
  | "too_large"
  | "too_narrow"
  | "invalid_aspect_ratio";

export type PhotoQcWarningReason =
  | "too_dark"
  | "too_bright"
  | "duplicate_image";

export type PhotoQcResult = {
  ok: boolean;
  rejectReason?: PhotoQcRejectReason;
  warnings: PhotoQcWarningReason[];
};

export function isAspectRatioValid(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) {
    return false;
  }

  const ratio = width / height;
  const landscapeValid =
    ratio >= PHOTO_MIN_ASPECT_RATIO && ratio <= PHOTO_MAX_ASPECT_RATIO;
  const portraitValid = ratio >= 9 / 16 && ratio <= 3 / 4;
  return landscapeValid || portraitValid;
}

export function validatePhotoBytes(byteLength: number): PhotoQcResult {
  if (byteLength > PHOTO_MAX_BYTES) {
    return { ok: false, rejectReason: "too_large", warnings: [] };
  }

  return { ok: true, warnings: [] };
}

export function validatePhotoDimensions(
  dimensions: PhotoDimensions,
): PhotoQcResult {
  if (dimensions.width < PHOTO_MIN_WIDTH_PX) {
    return { ok: false, rejectReason: "too_narrow", warnings: [] };
  }

  if (!isAspectRatioValid(dimensions.width, dimensions.height)) {
    return {
      ok: false,
      rejectReason: "invalid_aspect_ratio",
      warnings: [],
    };
  }

  return { ok: true, warnings: [] };
}

export function validatePhotoQc(input: {
  byteLength: number;
  width: number;
  height: number;
  averageLuminance?: number;
  duplicateInOtherSlot?: boolean;
}): PhotoQcResult {
  const sizeResult = validatePhotoBytes(input.byteLength);
  if (!sizeResult.ok) {
    return sizeResult;
  }

  const dimensionResult = validatePhotoDimensions({
    width: input.width,
    height: input.height,
  });
  if (!dimensionResult.ok) {
    return dimensionResult;
  }

  const warnings: PhotoQcWarningReason[] = [];

  if (input.averageLuminance !== undefined) {
    if (input.averageLuminance < 45) {
      warnings.push("too_dark");
    } else if (input.averageLuminance > 210) {
      warnings.push("too_bright");
    }
  }

  if (input.duplicateInOtherSlot) {
    warnings.push("duplicate_image");
  }

  return { ok: true, warnings };
}

export function getPhotoQcMessage(reason: PhotoQcRejectReason): string {
  switch (reason) {
    case "too_large":
      return "Photo must be 800KB or smaller after compression.";
    case "too_narrow":
      return "Photo must be at least 800px wide.";
    case "invalid_aspect_ratio":
      return "Photo aspect ratio must be between 4:3 and 16:9.";
  }
}

export function getPhotoQcWarningMessage(reason: PhotoQcWarningReason): string {
  switch (reason) {
    case "too_dark":
      return "This photo looks very dark. Consider retaking in better light.";
    case "too_bright":
      return "This photo looks very bright. Details may be hard to see.";
    case "duplicate_image":
      return "This looks like the same image as another slot.";
  }
}

export function computeAverageLuminance(samples: readonly number[]): number {
  if (samples.length === 0) {
    return 128;
  }

  const total = samples.reduce((sum, value) => sum + value, 0);
  return total / samples.length;
}
