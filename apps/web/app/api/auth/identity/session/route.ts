import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      { message: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(stripeSecret);

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: {
      user_id: user.id,
    },
    options: {
      document: {
        require_matching_selfie: true,
      },
    },
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
