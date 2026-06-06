import { confirmPhotoSchema } from "@veloxlane/schemas";
import { NextResponse } from "next/server";

import {
  assertDraftListingOwner,
  clearPhotoSlot,
  listListingPhotos,
} from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import {
  buildProcessedPhotoKey,
  copyPhotoToProcessedBucket,
  getPhotoPublicUrl,
} from "@/lib/s3/photos";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = confirmPhotoSchema.safeParse(await request.json());
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

    const replaced = await clearPhotoSlot(
      supabase,
      parsed.data.listingId,
      parsed.data.angleSlot,
    );

    const processedKey = buildProcessedPhotoKey(
      parsed.data.listingId,
      parsed.data.photoId,
    );

    await copyPhotoToProcessedBucket({
      storageKey: parsed.data.storageKey,
      processedKey,
    });

    const { data, error } = await supabase
      .from("photos")
      .insert({
        id: parsed.data.photoId,
        listing_id: parsed.data.listingId,
        storage_path: parsed.data.storageKey,
        processed_path: processedKey,
        angle_slot: parsed.data.angleSlot,
        approved: true,
        ai_quality_score: null,
        plate_cover_status: "not_applicable",
        source: "guided",
      })
      .select(
        "id, listing_id, storage_path, processed_path, angle_slot, approved, created_at",
      )
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to save photo.");
    }

    if (replaced?.storage_path || replaced?.processed_path) {
      const { deletePhotoObjects } = await import("@/lib/s3/photos");
      await deletePhotoObjects({
        storageKey: replaced.storage_path,
        processedKey: replaced.processed_path,
      });
    }

    const photos = await listListingPhotos(supabase, parsed.data.listingId);

    return NextResponse.json({
      photo: {
        ...data,
        publicUrl: getPhotoPublicUrl(data.processed_path),
      },
      photos: photos.map((photo) => ({
        ...photo,
        publicUrl: getPhotoPublicUrl(photo.processed_path),
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save photo.";
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ message }, { status });
  }
}
