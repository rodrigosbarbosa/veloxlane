import { describe, expect, it } from "vitest";

import {
  areRequiredPhotoSlotsFilled,
  getPhotoSlotLabel,
  photoSlotDefinitions,
} from "./slots";

describe("photoSlotDefinitions", () => {
  it("defines 10 labeled slots with four required angles", () => {
    expect(photoSlotDefinitions).toHaveLength(10);
    expect(
      photoSlotDefinitions
        .filter((slot) => slot.required)
        .map((slot) => slot.slot),
    ).toEqual([1, 2, 3, 4]);
  });
});

describe("getPhotoSlotLabel", () => {
  it("returns a friendly label for known slots", () => {
    expect(getPhotoSlotLabel(7)).toBe("Dashboard + odometer");
  });
});

describe("areRequiredPhotoSlotsFilled", () => {
  it("requires slots 1 through 4", () => {
    expect(areRequiredPhotoSlotsFilled([1, 2, 3])).toBe(false);
    expect(areRequiredPhotoSlotsFilled([1, 2, 3, 4])).toBe(true);
  });
});
