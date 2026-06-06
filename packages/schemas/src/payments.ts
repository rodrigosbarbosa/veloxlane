import { z } from "zod";

export const platformPaymentTypeSchema = z.enum([
  "listing",
  "unlock",
  "featured",
]);

export const phase2PaymentTypeSchema = z.enum([
  "carfax_bundle",
  "buyer_protection",
]);

export const paymentTypeSchema = z.enum([
  "listing",
  "unlock",
  "featured",
  "carfax_bundle",
  "buyer_protection",
]);

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const createPaymentIntentSchema = z.object({
  type: platformPaymentTypeSchema,
  relatedId: z.string().uuid(),
});

export type PlatformPaymentTypeInput = z.infer<
  typeof platformPaymentTypeSchema
>;
export type PaymentTypeInput = z.infer<typeof paymentTypeSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;
