const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

import type { ListingPhoto } from "./photos-types";

export type { ListingPhoto };

async function authorizedFetch(
  path: string,
  init: RequestInit,
  accessToken: string,
): Promise<Response> {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function createDraftListing(
  accessToken: string,
  input: {
    vin: string;
    make: string;
    model: string;
    year: number;
    listingId?: string;
  },
): Promise<{ listingId: string }> {
  const response = await authorizedFetch(
    "/api/listings/draft",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    accessToken,
  );
  const payload = await parseJson<{ message?: string; listingId?: string }>(
    response,
  );

  if (!response.ok || !payload.listingId) {
    throw new Error(payload.message ?? "Unable to save draft listing.");
  }

  return { listingId: payload.listingId };
}

export async function fetchListingPhotos(
  accessToken: string,
  listingId: string,
): Promise<ListingPhoto[]> {
  const response = await authorizedFetch(
    `/api/photos?listingId=${listingId}`,
    { method: "GET" },
    accessToken,
  );
  const payload = await parseJson<{
    message?: string;
    photos?: ListingPhoto[];
  }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to load photos.");
  }

  return payload.photos ?? [];
}

export async function uploadListingPhoto(
  accessToken: string,
  input: {
    listingId: string;
    angleSlot: number;
    blob: Blob;
  },
): Promise<ListingPhoto[]> {
  const presignResponse = await authorizedFetch(
    "/api/photos/presign",
    {
      method: "POST",
      body: JSON.stringify({
        listingId: input.listingId,
        angleSlot: input.angleSlot,
        contentType: "image/jpeg",
      }),
    },
    accessToken,
  );
  const presign = await parseJson<{
    message?: string;
    photoId?: string;
    storageKey?: string;
    uploadUrl?: string;
  }>(presignResponse);

  if (
    !presignResponse.ok ||
    !presign.photoId ||
    !presign.storageKey ||
    !presign.uploadUrl
  ) {
    throw new Error(presign.message ?? "Unable to prepare upload.");
  }

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: input.blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload to storage failed.");
  }

  const confirmResponse = await authorizedFetch(
    "/api/photos/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        listingId: input.listingId,
        photoId: presign.photoId,
        angleSlot: input.angleSlot,
        storageKey: presign.storageKey,
      }),
    },
    accessToken,
  );
  const payload = await parseJson<{
    message?: string;
    photos?: ListingPhoto[];
  }>(confirmResponse);

  if (!confirmResponse.ok) {
    throw new Error(payload.message ?? "Unable to save photo.");
  }

  return payload.photos ?? [];
}

export async function deleteListingPhoto(
  accessToken: string,
  photoId: string,
): Promise<void> {
  const response = await authorizedFetch(
    `/api/photos/${photoId}`,
    { method: "DELETE" },
    accessToken,
  );
  const payload = await parseJson<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to delete photo.");
  }
}

export async function reorderListingPhotos(
  accessToken: string,
  input: {
    listingId: string;
    slots: Array<{ photoId: string; angleSlot: number }>;
  },
): Promise<void> {
  const response = await authorizedFetch(
    "/api/photos/reorder",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    accessToken,
  );
  const payload = await parseJson<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to reorder photos.");
  }
}
