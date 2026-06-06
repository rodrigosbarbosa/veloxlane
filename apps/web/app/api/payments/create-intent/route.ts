import { createPaymentIntentSchema } from "@veloxlane/schemas";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = createPaymentIntentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase.functions.invoke(
    "stripe-create-intent",
    {
      body: parsed.data,
    },
  );

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "Unable to start checkout." },
      { status: 502 },
    );
  }

  if (!data || typeof data !== "object" || !("clientSecret" in data)) {
    return NextResponse.json(
      { message: "Unable to start checkout." },
      { status: 502 },
    );
  }

  return NextResponse.json(data);
}
