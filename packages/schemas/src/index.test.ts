import { describe, expect, it } from "vitest";

import { listingStatusSchema } from "./index";

describe("listingStatusSchema", () => {
  it("accepts known listing statuses", () => {
    expect(listingStatusSchema.parse("active")).toBe("active");
  });

  it("rejects unknown statuses", () => {
    expect(() => listingStatusSchema.parse("dealer")).toThrow();
  });
});
