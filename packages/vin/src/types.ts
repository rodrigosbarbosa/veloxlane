import { z } from "zod";

export const carfaxDataSchema = z.object({
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  accidentCount: z.number().int().nonnegative().optional(),
  ownerCount: z.number().int().positive().optional(),
  titleIssues: z.boolean().optional(),
  serviceRecords: z.number().int().nonnegative().optional(),
  cached: z.boolean().optional(),
  stub: z.boolean().optional(),
});

export const marketcheckDataSchema = z.object({
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  fairPriceLow: z.number().nonnegative().optional(),
  fairPriceHigh: z.number().nonnegative().optional(),
  fairPriceMid: z.number().nonnegative().optional(),
  cached: z.boolean().optional(),
  stub: z.boolean().optional(),
});

export const nhtsaRecallSchema = z.object({
  campaignNumber: z.string().optional(),
  component: z.string().optional(),
  summary: z.string().optional(),
  consequence: z.string().optional(),
  remedy: z.string().optional(),
});

export const nhtsaDataSchema = z.object({
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  recallCount: z.number().int().nonnegative().optional(),
  recalls: z.array(nhtsaRecallSchema).optional(),
  stub: z.boolean().optional(),
});

export const vinLookupPreviewSchema = z.object({
  vin: z.string(),
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  carfax: carfaxDataSchema.nullable(),
  marketcheck: marketcheckDataSchema.nullable(),
  nhtsa: nhtsaDataSchema.nullable(),
  errors: z
    .object({
      carfax: z.string().optional(),
      marketcheck: z.string().optional(),
      nhtsa: z.string().optional(),
    })
    .optional(),
});

export type CarfaxData = z.infer<typeof carfaxDataSchema>;
export type MarketcheckData = z.infer<typeof marketcheckDataSchema>;
export type NhtsaData = z.infer<typeof nhtsaDataSchema>;
export type VinLookupPreview = z.infer<typeof vinLookupPreviewSchema>;
