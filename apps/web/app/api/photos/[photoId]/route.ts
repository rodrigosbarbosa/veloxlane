import { NextResponse } from "next/server";

import { assertDraftListingOwner } from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import { deletePhotoObjects } from "@/lib/s3/photos";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: { photoId: string };
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { photoId } = context.params;

  const supabase = createClient();
  const session = await requireApiSession(supabase, _request);
  if ("response" in session) {
    return session.response;
  }

  const { data: photo, error } = await supabase
    .from("photos")
    .select("id, listing_id, storage_path, processed_path")
    .eq("id", photoId)
    .maybeSingle();

  if (error || !photo) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  try {
    await assertDraftListingOwner(supabase, photo.listing_id, session.userId);

    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    await deletePhotoObjects({
      storageKey: photo.storage_path,
      processedKey: photo.processed_path,
    });

    return NextResponse.json({ ok: true });
  } catch (deleteFailure) {
    const message =
      deleteFailure instanceof Error
        ? deleteFailure.message
        : "Unable to delete photo.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
