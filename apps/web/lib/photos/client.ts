export type ListingPhoto = {
  id: string;
  listing_id: string;
  angle_slot: number | null;
  publicUrl: string | null;
  approved: boolean;
};

export type PresignResponse = {
  photoId: string;
  storageKey: string;
  processedKey: string;
  uploadUrl: string;
  expiresIn: number;
  angleSlot: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function fetchListingPhotos(
  listingId: string,
): Promise<ListingPhoto[]> {
  const response = await fetch(`/api/photos?listingId=${listingId}`);
  const payload = await parseJson<{
    message?: string;
    photos?: ListingPhoto[];
  }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to load photos.");
  }

  return payload.photos ?? [];
}

export async function createDraftListing(input: {
  vin: string;
  make: string;
  model: string;
  year: number;
  listingId?: string;
}): Promise<{ listingId: string }> {
  const response = await fetch("/api/listings/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<{ message?: string; listingId?: string }>(
    response,
  );

  if (!response.ok || !payload.listingId) {
    throw new Error(payload.message ?? "Unable to save draft listing.");
  }

  return { listingId: payload.listingId };
}

export async function presignPhotoUpload(input: {
  listingId: string;
  angleSlot: number;
}): Promise<PresignResponse> {
  const response = await fetch("/api/photos/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId: input.listingId,
      angleSlot: input.angleSlot,
      contentType: "image/jpeg",
    }),
  });
  const payload = await parseJson<PresignResponse & { message?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to prepare upload.");
  }

  return payload;
}

export async function confirmPhotoUpload(input: {
  listingId: string;
  photoId: string;
  angleSlot: number;
  storageKey: string;
}): Promise<ListingPhoto[]> {
  const response = await fetch("/api/photos/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<{
    message?: string;
    photos?: ListingPhoto[];
  }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to save photo.");
  }

  return payload.photos ?? [];
}

export async function deleteListingPhoto(photoId: string): Promise<void> {
  const response = await fetch(`/api/photos/${photoId}`, {
    method: "DELETE",
  });
  const payload = await parseJson<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to delete photo.");
  }
}

export async function reorderListingPhotos(input: {
  listingId: string;
  slots: Array<{ photoId: string; angleSlot: number }>;
}): Promise<void> {
  const response = await fetch("/api/photos/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to reorder photos.");
  }
}

export async function uploadPreparedPhoto(input: {
  listingId: string;
  angleSlot: number;
  blob: Blob;
}): Promise<ListingPhoto[]> {
  const presign = await presignPhotoUpload({
    listingId: input.listingId,
    angleSlot: input.angleSlot,
  });

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: input.blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload to storage failed.");
  }

  return confirmPhotoUpload({
    listingId: input.listingId,
    photoId: presign.photoId,
    angleSlot: input.angleSlot,
    storageKey: presign.storageKey,
  });
}
