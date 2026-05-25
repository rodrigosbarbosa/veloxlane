import { describe, expect, it } from "vitest";
import { requiredPhotoCount, summarizeListingFlow } from "./listingFlow";

describe("summarizeListingFlow", () => {
  it("reports the next seller step and remaining guided photos", () => {
    const summary = summarizeListingFlow({
      completedStepIds: ["photos"],
      photoCount: 7,
    });

    expect(summary.completedCount).toBe(1);
    expect(summary.progress).toBe(0.2);
    expect(summary.nextStep?.id).toBe("vin");
    expect(summary.photosRemaining).toBe(3);
    expect(summary.isReadyToPublish).toBe(false);
  });

  it("marks the listing ready when required trust steps are complete", () => {
    const summary = summarizeListingFlow({
      completedStepIds: ["photos", "vin", "identity", "escrow"],
      photoCount: requiredPhotoCount,
      vin: "1HGCM82633A004352",
    });

    expect(summary.nextStep?.id).toBe("publish");
    expect(summary.photosRemaining).toBe(0);
    expect(summary.isReadyToPublish).toBe(true);
  });
});
