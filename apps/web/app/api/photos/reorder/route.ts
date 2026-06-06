import { reorderPhotosSchema } from "@veloxlane/schemas";
import { NextResponse } from "next/server";

import { assertDraftListingOwner } from "@/lib/listings/draft";
import { requireApiSession } from "@/lib/api/session";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const parsed = reorderPhotosSchema.safeParse(await request.json());
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

    const slotNumbers = parsed.data.slots.map((slot) => slot.angleSlot);
    if (new Set(slotNumbers).size !== slotNumbers.length) {
      return NextResponse.json(
        { message: "Each slot can only be assigned once." },
        { status: 400 },
      );
    }

    for (const slot of parsed.data.slots) {
      const { error } = await supabase
        .from("photos")
        .update({ angle_slot: slot.angleSlot + 100 })
        .eq("id", slot.photoId)
        .eq("listing_id", parsed.data.listingId);

      if (error) {
        throw new Error(error.message);
      }
    }

    for (const slot of parsed.data.slots) {
      const { error } = await supabase
        .from("photos")
        .update({ angle_slot: slot.angleSlot })
        .eq("id", slot.photoId)
        .eq("listing_id", parsed.data.listingId);

      if (error) {
        throw new Error(error.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reorder photos.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
