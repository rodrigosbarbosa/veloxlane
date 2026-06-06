import type { SupabaseClient } from "@supabase/supabase-js";

import {
  dispatchPaymentSuccess,
  getAmountCents,
  isPlatformPaymentType,
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

export async function createPaymentDispatchDeps(
  _supabase: SupabaseClient,
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
  return {
    activateListing: async (listingId, sellerId) => {
      // TODO(P1.11): set listing status to active after publish checks pass.
      console.info("[payments] activateListing stub", { listingId, sellerId });
    },
    revealUnlock: async (
      listingId,
      buyerId,
      stripePaymentIntentId,
      amountCents,
    ) => {
      // TODO(P1.13): insert unlock row via service role (webhook-only table).
      console.info("[payments] revealUnlock stub", {
        listingId,
        buyerId,
        stripePaymentIntentId,
        amountCents,
      });
    },
    applyFeaturedBoost: async (listingId, sellerId) => {
      // TODO(P1.11): apply featured boost window on listing.
      console.info("[payments] applyFeaturedBoost stub", {
        listingId,
        sellerId,
      });
    },
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
