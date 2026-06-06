import { NextResponse } from "next/server";

import {
  assertDraftListingOwner,
  listListingPhotos,
} from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import { getPhotoPublicUrl } from "@/lib/s3/photos";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const listingId = new URL(request.url).searchParams.get("listingId");
  if (!listingId) {
    return NextResponse.json(
      { message: "listingId is required." },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const session = await requireApiSession(supabase, request);
  if ("response" in session) {
    return session.response;
  }

  try {
    await assertDraftListingOwner(supabase, listingId, session.userId);
    const photos = await listListingPhotos(supabase, listingId);

    return NextResponse.json({
      photos: photos.map((photo) => ({
        ...photo,
        publicUrl: getPhotoPublicUrl(photo.processed_path),
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load photos.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
