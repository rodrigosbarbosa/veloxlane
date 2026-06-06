import { describe, expect, it } from "vitest";

import { getPriceRangePosition, mergeVinLookupPreview } from "./lookup";

const VALID_VIN = "1HGCM82633A004352";

describe("mergeVinLookupPreview", () => {
  it("merges successful sources and surfaces partial errors", () => {
    const preview = mergeVinLookupPreview(VALID_VIN, {
      carfax: {
        ok: true,
        data: {
          year: 2003,
          make: "Honda",
          model: "Accord",
          accidentCount: 0,
          ownerCount: 2,
        },
      },
      marketcheck: {
        ok: false,
        error: "Pricing unavailable right now.",
      },
      nhtsa: {
        ok: true,
        data: {
          year: 2003,
          make: "HONDA",
          model: "Accord",
          recallCount: 1,
          recalls: [{ campaignNumber: "23V123" }],
        },
      },
    });

    expect(preview.year).toBe(2003);
    expect(preview.make).toBe("Honda");
    expect(preview.model).toBe("Accord");
    expect(preview.carfax?.accidentCount).toBe(0);
    expect(preview.marketcheck).toBeNull();
    expect(preview.nhtsa?.recallCount).toBe(1);
    expect(preview.errors?.marketcheck).toBe("Pricing unavailable right now.");
  });

  it("falls back across sources for vehicle identity", () => {
    const preview = mergeVinLookupPreview(VALID_VIN, {
      carfax: { ok: false, error: "CARFAX down" },
      marketcheck: {
        ok: true,
        data: {
          year: 2018,
          make: "Tesla",
          model: "Model 3",
          fairPriceLow: 18000,
        },
      },
      nhtsa: { ok: false, error: "NHTSA down" },
    });

    expect(preview.year).toBe(2018);
    expect(preview.make).toBe("Tesla");
    expect(preview.model).toBe("Model 3");
    expect(preview.errors?.carfax).toBe("CARFAX down");
    expect(preview.errors?.nhtsa).toBe("NHTSA down");
  });
});

describe("mergeVinLookupPreview without errors", () => {
  it("omits errors when every source succeeds", () => {
    const preview = mergeVinLookupPreview(VALID_VIN, {
      carfax: {
        ok: true,
        data: { year: 2003, make: "Honda", model: "Accord", accidentCount: 0 },
      },
      marketcheck: {
        ok: true,
        data: {
          year: 2003,
          make: "Honda",
          model: "Accord",
          fairPriceLow: 4000,
          fairPriceHigh: 6000,
          fairPriceMid: 5000,
        },
      },
      nhtsa: {
        ok: true,
        data: {
          year: 2003,
          make: "HONDA",
          model: "Accord",
          recallCount: 0,
          recalls: [],
        },
      },
    });

    expect(preview.errors).toBeUndefined();
  });

  it("uses NHTSA identity when paid sources are missing", () => {
    const preview = mergeVinLookupPreview(VALID_VIN, {
      carfax: { ok: false, error: "down" },
      marketcheck: { ok: false, error: "down" },
      nhtsa: {
        ok: true,
        data: { year: 2015, make: "SUBARU", model: "WRX", recallCount: 0 },
      },
    });

    expect(preview.year).toBe(2015);
    expect(preview.make).toBe("SUBARU");
    expect(preview.model).toBe("WRX");
  });
});

describe("getPriceRangePosition", () => {
  it("classifies price against the fair range", () => {
    expect(getPriceRangePosition(15000, 18000, 22000)).toBe("below");
    expect(getPriceRangePosition(20000, 18000, 22000)).toBe("fair");
    expect(getPriceRangePosition(25000, 18000, 22000)).toBe("above");
  });

  it("returns unknown for incomplete or invalid ranges", () => {
    expect(getPriceRangePosition(undefined, 18000, 22000)).toBe("unknown");
    expect(getPriceRangePosition(20000, null, 22000)).toBe("unknown");
    expect(getPriceRangePosition(20000, 22000, 18000)).toBe("unknown");
  });
});
