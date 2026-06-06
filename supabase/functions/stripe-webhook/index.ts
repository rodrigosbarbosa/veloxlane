import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

import {
  createPaymentDispatchDeps,
  dispatchPaymentSuccess,
  isPlatformPaymentType,
  recordPaymentAuditLog,
  type PaymentRow,
} from "../_shared/payments.ts";

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function isDuplicateEvent(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  return Boolean(data);
}

async function markEventProcessed(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("webhook_events").insert({
    id: eventId,
    source: "stripe",
  });

  if (error) {
    throw new Error(`Failed to record webhook event: ${error.message}`);
  }
}

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("stripe_payment_intent", paymentIntent.id)
    .maybeSingle();

  if (paymentError) {
    throw new Error(`Payment lookup failed: ${paymentError.message}`);
  }

  if (!payment) {
    throw new Error(`No payment row for intent ${paymentIntent.id}`);
  }

  const paymentRow = payment as PaymentRow;

  if (paymentRow.status === "paid") {
    return;
  }

  if (paymentRow.amount_cents !== paymentIntent.amount) {
    throw new Error(
      `Amount mismatch for ${paymentIntent.id}: expected ${paymentRow.amount_cents}, got ${paymentIntent.amount}`,
    );
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ status: "paid" })
    .eq("id", paymentRow.id)
    .eq("status", "pending");

  if (updateError) {
    throw new Error(`Failed to mark payment paid: ${updateError.message}`);
  }

  await recordPaymentAuditLog(supabase, paymentRow);

  if (!isPlatformPaymentType(paymentRow.type)) {
    throw new Error(`Unsupported paid payment type: ${paymentRow.type}`);
  }

  const deps = await createPaymentDispatchDeps(supabase);
  await dispatchPaymentSuccess(
    paymentRow.type,
    {
      paymentId: paymentRow.id,
      userId: paymentRow.user_id,
      relatedId: paymentRow.related_id,
      stripePaymentIntentId: paymentRow.stripe_payment_intent,
      amountCents: paymentRow.amount_cents,
    },
    deps,
  );
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ message: "Server configuration error." }, 500);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ message: "Missing Stripe signature." }, 400);
  }

  const body = await request.text();
  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-11-20.acacia",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";
    return jsonResponse({ message }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (await isDuplicateEvent(supabase, event.id)) {
    return jsonResponse({ received: true, duplicate: true });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await handlePaymentIntentSucceeded(
        supabase,
        event.data.object as Stripe.PaymentIntent,
      );
    }

    await markEventProcessed(supabase, event.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed.";
    console.error("[stripe-webhook]", message);
    return jsonResponse({ message }, 500);
  }

  return jsonResponse({ received: true });
});
