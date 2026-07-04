import { describe, expect, it } from "vitest";

import {
  computeAverageLuminance,
  getPhotoQcMessage,
  getPhotoQcWarningMessage,
  isAspectRatioValid,
  validatePhotoBytes,
  validatePhotoDimensions,
  validatePhotoQc,
} from "./qc";
import { PHOTO_MAX_BYTES } from "./constants";

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
  it("rejects oversize uploads through the combined validator", () => {
    const result = validatePhotoQc({
      byteLength: PHOTO_MAX_BYTES + 1,
      width: 1600,
      height: 1200,
    });

    expect(result.ok).toBe(false);
    expect(result.rejectReason).toBe("too_large");
  });

  it("rejects narrow uploads through the combined validator", () => {
    const result = validatePhotoQc({
      byteLength: 500_000,
      width: 700,
      height: 525,
    });

    expect(result.ok).toBe(false);
    expect(result.rejectReason).toBe("too_narrow");
  });

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

  it("warns on very bright photos", () => {
    const result = validatePhotoQc({
      byteLength: 500_000,
      width: 1600,
      height: 1200,
      averageLuminance: 230,
    });

    expect(result.warnings).toEqual(["too_bright"]);
  });
});

describe("computeAverageLuminance", () => {
  it("returns the mean luminance", () => {
    expect(computeAverageLuminance([100, 200])).toBe(150);
  });

  it("returns a neutral default for empty samples", () => {
    expect(computeAverageLuminance([])).toBe(128);
  });
});

describe("photo QC messages", () => {
  it("maps reject and warning reasons to copy", () => {
    expect(getPhotoQcMessage("too_large")).toContain("800KB");
    expect(getPhotoQcMessage("too_narrow")).toContain("800px");
    expect(getPhotoQcMessage("invalid_aspect_ratio")).toContain("4:3");
    expect(getPhotoQcWarningMessage("too_dark")).toContain("dark");
    expect(getPhotoQcWarningMessage("too_bright")).toContain("bright");
    expect(getPhotoQcWarningMessage("duplicate_image")).toContain("same image");
  });
});

describe("validatePhotoDimensions edge cases", () => {
  it("rejects invalid dimensions", () => {
    expect(validatePhotoDimensions({ width: 0, height: 1200 }).ok).toBe(false);
    expect(isAspectRatioValid(0, 1200)).toBe(false);
  });
});
