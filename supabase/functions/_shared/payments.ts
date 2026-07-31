import type { SupabaseClient } from "@supabase/supabase-js";

import {
  activateListingOnPayment,
  applyFeaturedBoostOnPayment,
  dispatchPaymentSuccess,
  getAmountCents,
  isPlatformPaymentType,
  revealUnlockOnPayment,
  type FulfillmentStore,
  type PaymentDispatchContext,
  type PlatformPaymentType,
} from "../../../packages/payments/src/index.ts";

export { getAmountCents, isPlatformPaymentType, dispatchPaymentSuccess };
export type { PaymentDispatchContext, PlatformPaymentType };

export type PaymentRow = {
  id: string;
  user_id: string;
  type: string;
  amount_cents: number;
  stripe_payment_intent: string;
  status: string;
  related_id: string | null;
};

/**
 * Supabase-backed {@link FulfillmentStore}. Runs under the service-role client,
 * so it bypasses RLS to write the webhook-only `unlocks` table and to transition
 * listing status. All writes are scoped by owner (and status, for activation) so
 * a payment can only ever mutate the resource it paid for.
 */
function createFulfillmentStore(supabase: SupabaseClient): FulfillmentStore {
  return {
    activateDraftListing: async (listingId, sellerId) => {
      const { error } = await supabase
        .from("listings")
        .update({ status: "active", published_at: new Date().toISOString() })
        .eq("id", listingId)
        .eq("seller_id", sellerId)
        .eq("status", "draft");

      if (error) {
        throw new Error(`activateDraftListing failed: ${error.message}`);
      }
    },
    unlockExistsForIntent: async (stripePaymentIntentId) => {
      const { data, error } = await supabase
        .from("unlocks")
        .select("id")
        .eq("stripe_payment_intent", stripePaymentIntentId)
        .maybeSingle();

      if (error) {
        throw new Error(`unlockExistsForIntent failed: ${error.message}`);
      }

      return Boolean(data);
    },
    insertUnlock: async (unlock) => {
      const { error } = await supabase.from("unlocks").insert({
        listing_id: unlock.listingId,
        buyer_id: unlock.buyerId,
        stripe_payment_intent: unlock.stripePaymentIntentId,
        amount: unlock.amount,
      });

      if (error) {
        throw new Error(`insertUnlock failed: ${error.message}`);
      }
    },
    setListingFeaturedUntil: async (listingId, sellerId, until) => {
      const { error } = await supabase
        .from("listings")
        .update({ featured_until: until })
        .eq("id", listingId)
        .eq("seller_id", sellerId);

      if (error) {
        throw new Error(`setListingFeaturedUntil failed: ${error.message}`);
      }
    },
  };
}

export async function createPaymentDispatchDeps(
  supabase: SupabaseClient,
): Promise<{
  activateListing: (listingId: string, sellerId: string) => Promise<void>;
  revealUnlock: (
    listingId: string,
    buyerId: string,
    stripePaymentIntentId: string,
    amountCents: number,
  ) => Promise<void>;
  applyFeaturedBoost: (listingId: string, sellerId: string) => Promise<void>;
}> {
  const store = createFulfillmentStore(supabase);

  return {
    activateListing: (listingId, sellerId) =>
      activateListingOnPayment(store, listingId, sellerId),
    revealUnlock: (listingId, buyerId, stripePaymentIntentId, amountCents) =>
      revealUnlockOnPayment(store, {
        listingId,
        buyerId,
        stripePaymentIntentId,
        amountCents,
      }),
    applyFeaturedBoost: (listingId, sellerId) =>
      applyFeaturedBoostOnPayment(store, listingId, sellerId),
  };
}

export async function recordPaymentAuditLog(
  supabase: SupabaseClient,
  payment: PaymentRow,
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: payment.user_id,
    action: "payment_succeeded",
    resource_type: "payments",
    resource_id: payment.id,
    metadata: {
      type: payment.type,
      amount_cents: payment.amount_cents,
      stripe_payment_intent: payment.stripe_payment_intent,
      related_id: payment.related_id,
    },
  });

  if (error) {
    throw new Error(`Failed to write payment audit log: ${error.message}`);
  }
}
