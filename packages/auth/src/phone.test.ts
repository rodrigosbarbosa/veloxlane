import { describe, expect, it } from "vitest";

import { isValidUsPhone, maskPhone, normalizeUsPhone } from "./phone";

describe("phone", () => {
  it("normalizes ten-digit US numbers", () => {
    expect(normalizeUsPhone("(305) 555-0101")).toBe("+13055550101");
  });

  it("normalizes eleven-digit numbers with country code", () => {
    expect(normalizeUsPhone("13055550101")).toBe("+13055550101");
  });

  it("rejects invalid numbers", () => {
    expect(isValidUsPhone("123")).toBe(false);
    expect(normalizeUsPhone("123")).toBeNull();
  });

  it("masks verified numbers for display", () => {
    expect(maskPhone("+13055550101")).toBe("+1 (***) ***-0101");
  });

  it("returns original text when masking fails", () => {
    expect(maskPhone("invalid")).toBe("invalid");
  });

  it("normalizes numbers that already include +1", () => {
    expect(normalizeUsPhone("+13055550101")).toBe("+13055550101");
  });
});
