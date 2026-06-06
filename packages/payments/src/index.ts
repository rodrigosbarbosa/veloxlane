export {
  PaymentAmountError,
  formatAmountCents,
  getAmountCents,
  isImplementedPaymentType,
  isPlatformPaymentType,
} from "./amounts";
export {
  PaymentDispatchError,
  dispatchPaymentSuccess,
  type PaymentDispatchContext,
  type PaymentDispatchDeps,
  type PaymentDispatchResult,
} from "./dispatcher";
export {
  PAYMENT_TYPE_LABELS,
  PHASE2_FEE_AMOUNTS,
  PLATFORM_FEE_AMOUNTS,
  type PaymentType,
  type Phase2PaymentType,
  type PlatformPaymentType,
} from "./prices";

/**
 * Stripe test cards (https://docs.stripe.com/testing):
 * - 4242 4242 4242 4242 — success
 * - 4000 0000 0000 9995 — insufficient funds
 * - 4000 0025 0000 3155 — requires 3DS authentication
 */
