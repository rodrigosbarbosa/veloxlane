import { randomUUID } from "node:crypto";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { PHOTO_PRESIGN_TTL_SECONDS } from "@veloxlane/photos";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getS3Config() {
  return {
    region: requireEnv("AWS_REGION", "us-east-1"),
    originalBucket: requireEnv(
      "S3_LISTINGS_ORIGINAL_BUCKET",
      process.env.S3_PHOTOS_BUCKET,
    ),
    processedBucket: requireEnv(
      "S3_LISTINGS_PROCESSED_BUCKET",
      process.env.S3_PHOTOS_PROCESSED_BUCKET,
    ),
    accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
  };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client;
  }

  const config = getS3Config();
  s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return s3Client;
}

export function buildListingPhotoKey(
  listingId: string,
  photoId: string,
): string {
  return `listings/${listingId}/original/${photoId}.jpg`;
}

export function buildProcessedPhotoKey(
  listingId: string,
  photoId: string,
): string {
  return `listings/${listingId}/processed/${photoId}.jpg`;
}

export async function createPhotoPresignedUpload(input: {
  listingId: string;
  photoId?: string;
}): Promise<{
  photoId: string;
  storageKey: string;
  processedKey: string;
  uploadUrl: string;
  expiresIn: number;
}> {
  const photoId = input.photoId ?? randomUUID();
  const storageKey = buildListingPhotoKey(input.listingId, photoId);
  const processedKey = buildProcessedPhotoKey(input.listingId, photoId);
  const config = getS3Config();

  const command = new PutObjectCommand({
    Bucket: config.originalBucket,
    Key: storageKey,
    ContentType: "image/jpeg",
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: PHOTO_PRESIGN_TTL_SECONDS,
  });

  return {
    photoId,
    storageKey,
    processedKey,
    uploadUrl,
    expiresIn: PHOTO_PRESIGN_TTL_SECONDS,
  };
}

export async function copyPhotoToProcessedBucket(input: {
  storageKey: string;
  processedKey: string;
}): Promise<void> {
  const config = getS3Config();
  await getS3Client().send(
    new CopyObjectCommand({
      Bucket: config.processedBucket,
      Key: input.processedKey,
      CopySource: `${config.originalBucket}/${input.storageKey}`,
      ContentType: "image/jpeg",
      MetadataDirective: "COPY",
    }),
  );
}

export async function deletePhotoObjects(input: {
  storageKey: string | null;
  processedKey: string | null;
}): Promise<void> {
  const config = getS3Config();
  const client = getS3Client();

  if (input.storageKey) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.originalBucket,
        Key: input.storageKey,
      }),
    );
  }

  if (input.processedKey) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.processedBucket,
        Key: input.processedKey,
      }),
    );
  }
}

export function getPhotoPublicUrl(processedKey: string | null): string | null {
  if (!processedKey) {
    return null;
  }

  const domain = process.env.CLOUDFRONT_PHOTOS_DOMAIN;
  if (domain) {
    return `https://${domain}/${processedKey}`;
  }

  const config = getS3Config();
  return `https://${config.processedBucket}.s3.${config.region}.amazonaws.com/${processedKey}`;
}
