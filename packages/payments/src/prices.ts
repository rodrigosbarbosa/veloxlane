/** Phase 1 platform fees — integer cents only. */
export const PLATFORM_FEE_AMOUNTS = {
  listing: 1200,
  unlock: 600,
  featured: 1800,
} as const;

/** Phase 2 add-ons — types only until implemented. */
export const PHASE2_FEE_AMOUNTS = {
  carfax_bundle: 1200,
  buyer_protection: 900,
} as const;

export type PlatformPaymentType = keyof typeof PLATFORM_FEE_AMOUNTS;
export type Phase2PaymentType = keyof typeof PHASE2_FEE_AMOUNTS;
export type PaymentType = PlatformPaymentType | Phase2PaymentType;

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  listing: "Listing fee",
  unlock: "Contact unlock",
  featured: "Featured upgrade",
  carfax_bundle: "CARFAX bundle",
  buyer_protection: "Buyer protection",
};
