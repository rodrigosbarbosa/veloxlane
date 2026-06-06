import { describe, expect, it } from "vitest";

import {
  CARFAX_CACHE_TTL_MS,
  getCacheTtlMs,
  isCacheFresh,
  MARKETCHECK_CACHE_TTL_MS,
} from "./cache";

describe("getCacheTtlMs", () => {
  it("returns provider-specific TTL values", () => {
    expect(getCacheTtlMs("carfax")).toBe(CARFAX_CACHE_TTL_MS);
    expect(getCacheTtlMs("marketcheck")).toBe(MARKETCHECK_CACHE_TTL_MS);
    expect(CARFAX_CACHE_TTL_MS).toBe(90 * 24 * 60 * 60 * 1000);
    expect(MARKETCHECK_CACHE_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe("isCacheFresh", () => {
  const now = new Date("2026-06-06T12:00:00.000Z");

  it("returns false when fetchedAt is missing or invalid", () => {
    expect(isCacheFresh(null, "carfax", now)).toBe(false);
    expect(isCacheFresh(undefined, "marketcheck", now)).toBe(false);
    expect(isCacheFresh("not-a-date", "carfax", now)).toBe(false);
  });

  it("returns true inside TTL and false when expired", () => {
    const fresh = new Date("2026-06-01T12:00:00.000Z");
    const stale = new Date("2026-02-01T12:00:00.000Z");

    expect(isCacheFresh(fresh, "carfax", now)).toBe(true);
    expect(isCacheFresh(stale, "carfax", now)).toBe(false);
    expect(isCacheFresh(fresh, "marketcheck", now)).toBe(true);
    expect(isCacheFresh(stale, "marketcheck", now)).toBe(false);
  });

  it("accepts Date instances", () => {
    const fetchedAt = new Date(now.getTime() - 1_000);
    expect(isCacheFresh(fetchedAt, "carfax", now)).toBe(true);
  });

  it("returns false for future timestamps", () => {
    const future = new Date("2026-06-07T12:00:00.000Z");
    expect(isCacheFresh(future, "carfax", now)).toBe(false);
  });
});
