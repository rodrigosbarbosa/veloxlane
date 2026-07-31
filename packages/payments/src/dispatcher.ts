import type { PlatformPaymentType } from "./prices";

export type PaymentDispatchContext = {
  paymentId: string;
  userId: string;
  relatedId: string | null;
  stripePaymentIntentId: string;
  amountCents: number;
};

export type PaymentDispatchResult = {
  action: PlatformPaymentType;
  relatedId: string | null;
};

export type PaymentDispatchDeps = {
  activateListing: (listingId: string, sellerId: string) => Promise<void>;
  revealUnlock: (
    listingId: string,
    buyerId: string,
    stripePaymentIntentId: string,
    amountCents: number,
  ) => Promise<void>;
  applyFeaturedBoost: (listingId: string, sellerId: string) => Promise<void>;
};

export class PaymentDispatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentDispatchError";
  }
}

function requireRelatedId(
  type: PlatformPaymentType,
  relatedId: string | null,
): string {
  if (!relatedId) {
    throw new PaymentDispatchError(
      `Payment type "${type}" requires a related_id.`,
    );
  }

  return relatedId;
}

/** Routes a successful platform-fee charge to the correct downstream action. */
export async function dispatchPaymentSuccess(
  type: PlatformPaymentType,
  context: PaymentDispatchContext,
  deps: PaymentDispatchDeps,
): Promise<PaymentDispatchResult> {
  const relatedId = requireRelatedId(type, context.relatedId);

  switch (type) {
    case "listing":
      await deps.activateListing(relatedId, context.userId);
      return { action: type, relatedId };
    case "unlock":
      await deps.revealUnlock(
        relatedId,
        context.userId,
        context.stripePaymentIntentId,
        context.amountCents,
      );
      return { action: type, relatedId };
    case "featured":
      await deps.applyFeaturedBoost(relatedId, context.userId);
      return { action: type, relatedId };
    default: {
      const exhaustive: never = type;
      throw new PaymentDispatchError(`Unhandled payment type: ${exhaustive}`);
    }
  }
}
