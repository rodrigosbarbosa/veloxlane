/**
 * Fulfillment logic for successful platform-fee payments.
 *
 * The correctness-critical logic (unlock idempotency, cents→dollars conversion,
 * featured-window duration) lives here as pure functions over an injected
 * {@link FulfillmentStore} port, so it is unit-testable without Supabase. The
 * Stripe webhook edge function implements the port against a service-role client.
 */

/** How long a paid `featured` upgrade keeps a listing featured. */
export const FEATURED_DURATION_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Row inserted into `unlocks` (amount is stored in dollars, not cents). */
export type UnlockInsert = {
  listingId: string;
  buyerId: string;
  stripePaymentIntentId: string;
  amount: number;
};

/** Persistence port implemented by the webhook against a service-role client. */
export type FulfillmentStore = {
  /** Transition a draft listing owned by `sellerId` to active. No-op otherwise. */
  activateDraftListing: (listingId: string, sellerId: string) => Promise<void>;
  /** Whether an unlock row already exists for this payment intent. */
  unlockExistsForIntent: (stripePaymentIntentId: string) => Promise<boolean>;
  /** Insert an unlock row (webhook-only table). */
  insertUnlock: (unlock: UnlockInsert) => Promise<void>;
  /** Set `featured_until` on a listing owned by `sellerId`. */
  setListingFeaturedUntil: (
    listingId: string,
    sellerId: string,
    until: string,
  ) => Promise<void>;
};

/** Convert a Stripe amount in cents to the dollars stored on `unlocks.amount`. */
export function unlockAmountDollars(amountCents: number): number {
  return Math.round(amountCents) / 100;
}

/** ISO timestamp marking the end of a featured window starting at `now`. */
export function featuredUntilFrom(now: Date): string {
  return new Date(
    now.getTime() + FEATURED_DURATION_DAYS * MS_PER_DAY,
  ).toISOString();
}

/** Activate the seller's draft listing after a paid `listing` fee. */
export async function activateListingOnPayment(
  store: FulfillmentStore,
  listingId: string,
  sellerId: string,
): Promise<void> {
  await store.activateDraftListing(listingId, sellerId);
}

/**
 * Reveal a contact unlock after a paid `unlock` fee. Idempotent: skips insertion
 * when an unlock already exists for this payment intent (webhook retries).
 */
export async function revealUnlockOnPayment(
  store: FulfillmentStore,
  args: {
    listingId: string;
    buyerId: string;
    stripePaymentIntentId: string;
    amountCents: number;
  },
): Promise<void> {
  if (await store.unlockExistsForIntent(args.stripePaymentIntentId)) {
    return;
  }

  await store.insertUnlock({
    listingId: args.listingId,
    buyerId: args.buyerId,
    stripePaymentIntentId: args.stripePaymentIntentId,
    amount: unlockAmountDollars(args.amountCents),
  });
}

/** Apply the featured window after a paid `featured` fee. */
export async function applyFeaturedBoostOnPayment(
  store: FulfillmentStore,
  listingId: string,
  sellerId: string,
  now: Date = new Date(),
): Promise<void> {
  await store.setListingFeaturedUntil(
    listingId,
    sellerId,
    featuredUntilFrom(now),
  );
}
