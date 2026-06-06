import {
  PHASE2_FEE_AMOUNTS,
  PLATFORM_FEE_AMOUNTS,
  type PaymentType,
  type PlatformPaymentType,
} from "./prices";

export class PaymentAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentAmountError";
  }
}

export function isPlatformPaymentType(
  type: PaymentType,
): type is PlatformPaymentType {
  return type in PLATFORM_FEE_AMOUNTS;
}

export function isImplementedPaymentType(
  type: PaymentType,
): type is PlatformPaymentType {
  return isPlatformPaymentType(type);
}

/** Server-side amount lookup — never trust client-supplied cents. */
export function getAmountCents(type: PaymentType): number {
  if (isPlatformPaymentType(type)) {
    return PLATFORM_FEE_AMOUNTS[type];
  }

  if (type in PHASE2_FEE_AMOUNTS) {
    throw new PaymentAmountError(
      `Payment type "${type}" is not available in Phase 1.`,
    );
  }

  throw new PaymentAmountError(`Unknown payment type: ${String(type)}`);
}

export function formatAmountCents(amountCents: number): string {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new PaymentAmountError("Amount must be a non-negative integer.");
  }

  return `$${(amountCents / 100).toFixed(2)}`;
}
