import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

import { getAmountCents } from "../_shared/payments.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateIntentBody = {
  type?: string;
  relatedId?: string;
};

const platformTypes = new Set(["listing", "unlock", "featured"]);

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ message: "Server configuration error." }, 500);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ message: "Sign in required." }, 401);
  }

  let body: CreateIntentBody;
  try {
    body = (await request.json()) as CreateIntentBody;
  } catch {
    return jsonResponse({ message: "Invalid JSON body." }, 400);
  }

  const type = body.type ?? "";
  const relatedId = body.relatedId ?? "";

  if (!platformTypes.has(type)) {
    return jsonResponse({ message: "Invalid payment type." }, 400);
  }

  if (!/^[0-9a-f-]{36}$/i.test(relatedId)) {
    return jsonResponse({ message: "Invalid relatedId." }, 400);
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ message: "Sign in required." }, 401);
  }

  let amountCents: number;
  try {
    amountCents = getAmountCents(type as "listing" | "unlock" | "featured");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid payment type.";
    return jsonResponse({ message }, 400);
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-11-20.acacia",
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: user.id,
      payment_type: type,
      related_id: relatedId,
    },
  });

  if (!paymentIntent.client_secret) {
    return jsonResponse({ message: "Unable to create payment." }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: payment, error: insertError } = await supabaseAdmin
    .from("payments")
    .insert({
      user_id: user.id,
      type,
      amount_cents: amountCents,
      stripe_payment_intent: paymentIntent.id,
      status: "pending",
      related_id: relatedId,
    })
    .select("id, amount_cents")
    .single();

  if (insertError || !payment) {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => undefined);
    return jsonResponse({ message: "Unable to record payment." }, 500);
  }

  return jsonResponse({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amountCents: payment.amount_cents,
    paymentId: payment.id,
  });
});
