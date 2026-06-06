import { z } from "zod";

export const angleSlotSchema = z.number().int().min(1).max(10);

export const createDraftListingSchema = z.object({
  vin: z.string().length(17),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  state: z.enum(["FL", "TX"]).default("FL"),
  location: z.string().min(1).default("Pending"),
  listingId: z.string().uuid().optional(),
});

export const presignPhotoSchema = z.object({
  listingId: z.string().uuid(),
  angleSlot: angleSlotSchema,
  contentType: z.literal("image/jpeg"),
});

export const confirmPhotoSchema = z.object({
  listingId: z.string().uuid(),
  photoId: z.string().uuid(),
  angleSlot: angleSlotSchema,
  storageKey: z.string().min(1),
});

export const reorderPhotosSchema = z.object({
  listingId: z.string().uuid(),
  slots: z
    .array(
      z.object({
        photoId: z.string().uuid(),
        angleSlot: angleSlotSchema,
      }),
    )
    .min(1)
    .max(10),
});

export type CreateDraftListingInput = z.infer<typeof createDraftListingSchema>;
export type PresignPhotoInput = z.infer<typeof presignPhotoSchema>;
export type ConfirmPhotoInput = z.infer<typeof confirmPhotoSchema>;
export type ReorderPhotosInput = z.infer<typeof reorderPhotosSchema>;
