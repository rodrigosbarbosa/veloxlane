import { describe, expect, it } from "vitest";

import {
  computeAverageLuminance,
  isAspectRatioValid,
  validatePhotoBytes,
  validatePhotoDimensions,
  validatePhotoQc,
} from "./qc";

describe("isAspectRatioValid", () => {
  it("accepts landscape ratios between 4:3 and 16:9", () => {
    expect(isAspectRatioValid(1600, 1200)).toBe(true);
    expect(isAspectRatioValid(1920, 1080)).toBe(true);
  });

  it("accepts portrait ratios between 3:4 and 9:16", () => {
    expect(isAspectRatioValid(1200, 1600)).toBe(true);
    expect(isAspectRatioValid(1080, 1920)).toBe(true);
  });

  it("rejects extreme ratios", () => {
    expect(isAspectRatioValid(3000, 500)).toBe(false);
    expect(isAspectRatioValid(500, 3000)).toBe(false);
  });
});

describe("validatePhotoBytes", () => {
  it("rejects files larger than 800KB", () => {
    expect(validatePhotoBytes(800 * 1024 + 1).ok).toBe(false);
  });

  it("accepts files at or below 800KB", () => {
    expect(validatePhotoBytes(800 * 1024).ok).toBe(true);
  });
});

describe("validatePhotoDimensions", () => {
  it("rejects photos narrower than 800px", () => {
    expect(validatePhotoDimensions({ width: 799, height: 600 }).ok).toBe(false);
  });

  it("rejects invalid aspect ratios", () => {
    expect(validatePhotoDimensions({ width: 2400, height: 400 }).ok).toBe(
      false,
    );
  });
});

describe("validatePhotoQc", () => {
  it("collects luminance and duplicate warnings without blocking", () => {
    const result = validatePhotoQc({
      byteLength: 500_000,
      width: 1600,
      height: 1200,
      averageLuminance: 20,
      duplicateInOtherSlot: true,
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual(["too_dark", "duplicate_image"]);
  });
});

describe("computeAverageLuminance", () => {
  it("returns the mean luminance", () => {
    expect(computeAverageLuminance([100, 200])).toBe(150);
  });
});
