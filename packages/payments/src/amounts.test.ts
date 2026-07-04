import { describe, expect, it } from "vitest";

import {
  PaymentAmountError,
  formatAmountCents,
  getAmountCents,
  isImplementedPaymentType,
  isPlatformPaymentType,
  PHASE2_FEE_AMOUNTS,
  PLATFORM_FEE_AMOUNTS,
} from "./index";

describe("getAmountCents", () => {
  it.each([
    ["listing", 1200],
    ["unlock", 600],
    ["featured", 1800],
  ] as const)("returns %i cents for %s", (type, expected) => {
    expect(getAmountCents(type)).toBe(expected);
  });

  it("rejects Phase 2 types that are not implemented", () => {
    for (const type of Object.keys(PHASE2_FEE_AMOUNTS) as Array<
      keyof typeof PHASE2_FEE_AMOUNTS
    >) {
      expect(() => getAmountCents(type)).toThrow(PaymentAmountError);
      expect(() => getAmountCents(type)).toThrow(/Phase 1/);
    }
  });

  it("rejects unknown payment types", () => {
    expect(() => getAmountCents("dealer_fee" as "listing")).toThrow(
      PaymentAmountError,
    );
  });
});

describe("isPlatformPaymentType", () => {
  it("identifies Phase 1 platform fee types", () => {
    for (const type of Object.keys(PLATFORM_FEE_AMOUNTS) as Array<
      keyof typeof PLATFORM_FEE_AMOUNTS
    >) {
      expect(isPlatformPaymentType(type)).toBe(true);
      expect(isImplementedPaymentType(type)).toBe(true);
    }
  });

  it("excludes Phase 2 types", () => {
    expect(isPlatformPaymentType("autocheck_bundle")).toBe(false);
    expect(isImplementedPaymentType("buyer_protection")).toBe(false);
  });
});

describe("formatAmountCents", () => {
  it("formats integer cents as USD", () => {
    expect(formatAmountCents(1200)).toBe("$12.00");
    expect(formatAmountCents(600)).toBe("$6.00");
    expect(formatAmountCents(1800)).toBe("$18.00");
  });

  it("rejects non-integer amounts", () => {
    expect(() => formatAmountCents(12.5)).toThrow(PaymentAmountError);
  });

  it("rejects negative amounts", () => {
    expect(() => formatAmountCents(-1)).toThrow(PaymentAmountError);
  });
});
