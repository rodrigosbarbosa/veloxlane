import { z } from "zod";

export const autocheckDataSchema = z.object({
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  accidentCount: z.number().int().nonnegative().optional(),
  ownerCount: z.number().int().positive().optional(),
  titleIssues: z.boolean().optional(),
  serviceRecords: z.number().int().nonnegative().optional(),
  /** AutoCheck Score (Experian's proprietary 1–100 vehicle score). */
  score: z.number().int().optional(),
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
  autocheck: autocheckDataSchema.nullable(),
  marketcheck: marketcheckDataSchema.nullable(),
  nhtsa: nhtsaDataSchema.nullable(),
  errors: z
    .object({
      autocheck: z.string().optional(),
      marketcheck: z.string().optional(),
      nhtsa: z.string().optional(),
    })
    .optional(),
});

export type AutocheckData = z.infer<typeof autocheckDataSchema>;
export type MarketcheckData = z.infer<typeof marketcheckDataSchema>;
export type NhtsaData = z.infer<typeof nhtsaDataSchema>;
export type VinLookupPreview = z.infer<typeof vinLookupPreviewSchema>;
