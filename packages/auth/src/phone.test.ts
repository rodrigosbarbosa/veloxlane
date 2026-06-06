import { describe, expect, it } from "vitest";

import {
  isValidUsPhone,
  maskPhone,
  normalizeUsPhone,
  validateUsPhone,
} from "./phone";

describe("phone", () => {
  it("normalizes bare ten-digit US numbers", () => {
    expect(normalizeUsPhone("9737762354")).toBe("+19737762354");
    expect(isValidUsPhone("9737762354")).toBe(true);
    expect(validateUsPhone("9737762354")).toBe(true);
  });

  it("normalizes formatted ten-digit US numbers", () => {
    expect(normalizeUsPhone("(973) 776-2354")).toBe("+19737762354");
    expect(normalizeUsPhone("(305) 555-0101")).toBe("+13055550101");
  });

  it("normalizes eleven-digit numbers with country code", () => {
    expect(normalizeUsPhone("13055550101")).toBe("+13055550101");
    expect(normalizeUsPhone("19737762354")).toBe("+19737762354");
  });

  it("normalizes numbers that already include +1", () => {
    expect(normalizeUsPhone("+13055550101")).toBe("+13055550101");
    expect(normalizeUsPhone("+19737762354")).toBe("+19737762354");
  });

  it("rejects invalid numbers", () => {
    expect(isValidUsPhone("123")).toBe(false);
    expect(normalizeUsPhone("123")).toBeNull();
    expect(normalizeUsPhone("123456789")).toBeNull();
    expect(normalizeUsPhone("123456789012")).toBeNull();
    expect(normalizeUsPhone("")).toBeNull();
  });

  it("masks verified numbers for display", () => {
    expect(maskPhone("+13055550101")).toBe("+1 (***) ***-0101");
    expect(maskPhone("9737762354")).toBe("+1 (***) ***-2354");
  });

  it("returns original text when masking fails", () => {
    expect(maskPhone("invalid")).toBe("invalid");
  });
});
