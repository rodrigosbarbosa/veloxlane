import { z } from "zod";

export * from "./auth";
export * from "./payments";
export * from "./phone";
export * from "./photos";

export const appEnvSchema = z.enum(["local", "staging", "production"]);

export const listingStatusSchema = z.enum([
  "draft",
  "active",
  "pending",
  "sold",
  "removed",
]);

export const offerStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "countered",
  "expired",
  "withdrawn",
]);

export type AppEnv = z.infer<typeof appEnvSchema>;
export type ListingStatus = z.infer<typeof listingStatusSchema>;
export type OfferStatus = z.infer<typeof offerStatusSchema>;
