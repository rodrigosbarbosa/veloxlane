import { presignPhotoSchema } from "@veloxlane/schemas";
import { NextResponse } from "next/server";

import { assertDraftListingOwner } from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import { createPhotoPresignedUpload } from "@/lib/s3/photos";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = presignPhotoSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const supabase = createClient();
  const session = await requireApiSession(supabase, request);
  if ("response" in session) {
    return session.response;
  }

  try {
    await assertDraftListingOwner(
      supabase,
      parsed.data.listingId,
      session.userId,
    );

    const presign = await createPhotoPresignedUpload({
      listingId: parsed.data.listingId,
    });

    return NextResponse.json({
      ...presign,
      angleSlot: parsed.data.angleSlot,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to prepare upload.";
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ message }, { status });
  }
}
