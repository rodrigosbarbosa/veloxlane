import { recordIdentityFailure, recordIdentitySuccess } from "@veloxlane/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json(
      { message: "Stripe not configured." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(stripeSecret);
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json(
      { message: "Missing signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { message: "Invalid signature." },
      { status: 400 },
    );
  }

  if (
    event.type !== "identity.verification_session.verified" &&
    event.type !== "identity.verification_session.requires_input"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Identity.VerificationSession;
  const userId = session.metadata?.user_id;

  if (!userId) {
    return NextResponse.json(
      { message: "Missing user metadata." },
      { status: 400 },
    );
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("identity_attempts, identity_manual_review, id_verified")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      { message: "Profile not found." },
      { status: 404 },
    );
  }

  if (event.type === "identity.verification_session.verified") {
    const nextState = recordIdentitySuccess({
      attempts: profile.identity_attempts,
      manualReview: profile.identity_manual_review,
      idVerified: profile.id_verified,
    });

    await service
      .from("profiles")
      .update({
        id_verified: nextState.idVerified,
        onboarding_step: "complete",
        identity_manual_review: nextState.manualReview,
      })
      .eq("id", userId);
  } else {
    const nextState = recordIdentityFailure({
      attempts: profile.identity_attempts,
      manualReview: profile.identity_manual_review,
      idVerified: profile.id_verified,
    });

    await service
      .from("profiles")
      .update({
        identity_attempts: nextState.attempts,
        identity_manual_review: nextState.manualReview,
        onboarding_step: nextState.manualReview ? "identity" : "identity",
      })
      .eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
