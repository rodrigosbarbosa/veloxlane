import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@veloxlane/db";
import type { CreateDraftListingInput } from "@veloxlane/schemas";

type ListingRow = {
  id: string;
  seller_id: string;
  status: string;
  vin: string;
};

export async function assertDraftListingOwner(
  supabase: SupabaseClient<Database>,
  listingId: string,
  userId: string,
): Promise<ListingRow> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, seller_id, status, vin")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Listing not found.");
  }

  if (data.seller_id !== userId) {
    throw new Error("You can only manage your own draft listing.");
  }

  if (data.status !== "draft") {
    throw new Error("Only draft listings can be edited.");
  }

  return data as ListingRow;
}

export async function upsertDraftListing(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateDraftListingInput,
): Promise<{ listingId: string }> {
  if (input.listingId) {
    await assertDraftListingOwner(supabase, input.listingId, userId);

    const { error } = await supabase
      .from("listings")
      .update({
        vin: input.vin,
        make: input.make,
        model: input.model,
        year: input.year,
        state: input.state,
        location: input.location,
      })
      .eq("id", input.listingId)
      .eq("seller_id", userId)
      .eq("status", "draft");

    if (error) {
      throw new Error(error.message);
    }

    return { listingId: input.listingId };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: userId,
      vin: input.vin,
      make: input.make,
      model: input.model,
      year: input.year,
      mileage: 0,
      price: 0,
      status: "draft",
      location: input.location,
      state: input.state,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create draft listing.");
  }

  return { listingId: data.id };
}

export type PhotoRecord = {
  id: string;
  listing_id: string;
  storage_path: string | null;
  processed_path: string | null;
  angle_slot: number | null;
  approved: boolean;
  created_at: string;
};

export async function listListingPhotos(
  supabase: SupabaseClient<Database>,
  listingId: string,
): Promise<PhotoRecord[]> {
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, listing_id, storage_path, processed_path, angle_slot, approved, created_at",
    )
    .eq("listing_id", listingId)
    .order("angle_slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PhotoRecord[];
}

export async function clearPhotoSlot(
  supabase: SupabaseClient<Database>,
  listingId: string,
  angleSlot: number,
): Promise<PhotoRecord | null> {
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, listing_id, storage_path, processed_path, angle_slot, approved, created_at",
    )
    .eq("listing_id", listingId)
    .eq("angle_slot", angleSlot)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", data.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return data as PhotoRecord;
}
