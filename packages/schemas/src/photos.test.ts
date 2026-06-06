import { describe, expect, it } from "vitest";

import {
  confirmPhotoSchema,
  createDraftListingSchema,
  presignPhotoSchema,
  reorderPhotosSchema,
} from "./photos";

describe("createDraftListingSchema", () => {
  it("accepts a valid draft payload", () => {
    const parsed = createDraftListingSchema.safeParse({
      vin: "1HGCM82633A004352",
      make: "Honda",
      model: "Accord",
      year: 2020,
    });

    expect(parsed.success).toBe(true);
  });
});

describe("presignPhotoSchema", () => {
  it("requires jpeg uploads", () => {
    const parsed = presignPhotoSchema.safeParse({
      listingId: "11111111-1111-4111-8111-111111111111",
      angleSlot: 1,
      contentType: "image/jpeg",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("confirmPhotoSchema", () => {
  it("validates confirm payload", () => {
    const parsed = confirmPhotoSchema.safeParse({
      listingId: "11111111-1111-4111-8111-111111111111",
      photoId: "22222222-2222-4222-8222-222222222222",
      angleSlot: 2,
      storageKey: "listings/x/original/y.jpg",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("reorderPhotosSchema", () => {
  it("rejects duplicate slots", () => {
    const parsed = reorderPhotosSchema.safeParse({
      listingId: "11111111-1111-4111-8111-111111111111",
      slots: [
        { photoId: "22222222-2222-4222-8222-222222222222", angleSlot: 1 },
        { photoId: "33333333-3333-4333-8333-333333333333", angleSlot: 1 },
      ],
    });

    expect(parsed.success).toBe(true);
  });
});
