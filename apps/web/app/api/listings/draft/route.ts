import { createDraftListingSchema } from "@veloxlane/schemas";
import { NextResponse } from "next/server";

import { upsertDraftListing } from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = createDraftListingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const supabase = createClient();
  const session = await requireApiSession(supabase, request);
  if ("response" in session) {
    return session.response;
  }

  try {
    const result = await upsertDraftListing(
      supabase,
      session.userId,
      parsed.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save draft listing.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
