import { describe, expect, it } from "vitest";

import {
  createPaymentIntentSchema,
  paymentStatusSchema,
  platformPaymentTypeSchema,
} from "./payments";

describe("platformPaymentTypeSchema", () => {
  it("accepts Phase 1 platform fee types", () => {
    expect(platformPaymentTypeSchema.parse("listing")).toBe("listing");
    expect(platformPaymentTypeSchema.parse("unlock")).toBe("unlock");
    expect(platformPaymentTypeSchema.parse("featured")).toBe("featured");
  });

  it("rejects Phase 2-only types", () => {
    expect(() => platformPaymentTypeSchema.parse("autocheck_bundle")).toThrow();
  });
});

describe("createPaymentIntentSchema", () => {
  it("requires a UUID relatedId", () => {
    expect(() =>
      createPaymentIntentSchema.parse({
        type: "unlock",
        relatedId: "not-a-uuid",
      }),
    ).toThrow();
  });

  it("accepts valid payloads", () => {
    expect(
      createPaymentIntentSchema.parse({
        type: "listing",
        relatedId: "550e8400-e29b-41d4-a716-446655440000",
      }),
    ).toEqual({
      type: "listing",
      relatedId: "550e8400-e29b-41d4-a716-446655440000",
    });
  });
});

describe("paymentStatusSchema", () => {
  it("accepts known statuses", () => {
    expect(paymentStatusSchema.parse("paid")).toBe("paid");
  });
});
