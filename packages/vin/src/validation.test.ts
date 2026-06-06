import { describe, expect, it } from "vitest";

import {
  computeVinCheckDigit,
  formatVinDisplay,
  isVinCheckDigitValid,
  normalizeVinInput,
  validateVin,
  vinSchema,
  VIN_LENGTH,
} from "./validation";

/** Known-valid VIN used across VeloxLane tests. */
const VALID_VIN = "1HGCM82633A004352";

describe("normalizeVinInput", () => {
  it("uppercases, strips invalid chars, and caps at 17", () => {
    expect(normalizeVinInput("  1hgcm82633a004352  ")).toBe(VALID_VIN);
    expect(normalizeVinInput("1HGCM82633A004352IOQ")).toBe("1HGCM82633A004352");
    expect(normalizeVinInput("1-HG-CM")).toBe("1HGCM");
  });
});

describe("formatVinDisplay", () => {
  it("groups VIN into WMI / VDS / VIS segments", () => {
    expect(formatVinDisplay(VALID_VIN)).toBe("1HG CM8263 3A004352");
    expect(formatVinDisplay("1HG")).toBe("1HG");
  });
});

describe("computeVinCheckDigit", () => {
  it("returns the ISO 3779 check digit", () => {
    expect(computeVinCheckDigit(VALID_VIN)).toBe("3");
  });

  it("returns X when remainder is 10", () => {
    expect(computeVinCheckDigit("1M8GDM9AXKP042788")).toBe("X");
  });

  it("returns empty for invalid length or characters", () => {
    expect(computeVinCheckDigit("SHORT")).toBe("");
    expect(computeVinCheckDigit("1IIIIIIIIIIIIIII")).toBe("");
  });
});

describe("isVinCheckDigitValid", () => {
  it("accepts valid VINs and rejects bad check digits", () => {
    expect(isVinCheckDigitValid(VALID_VIN)).toBe(true);
    expect(isVinCheckDigitValid("1HGCM82633A004353")).toBe(false);
    expect(isVinCheckDigitValid("SHORT")).toBe(false);
    expect(isVinCheckDigitValid("1IIIIIIIIIIIIIII")).toBe(false);
  });
});

describe("validateVin", () => {
  it("returns structured errors for each failure mode", () => {
    expect(validateVin("")).toMatchObject({ valid: false, code: "empty" });
    expect(validateVin("1HGCM8263")).toMatchObject({
      valid: false,
      code: "invalid_length",
    });
    expect(validateVin("1IIIIIIIIIIIIIII")).toMatchObject({
      valid: false,
      code: "invalid_characters",
    });
    expect(validateVin("1HGCM82633A004353")).toMatchObject({
      valid: false,
      code: "invalid_check_digit",
    });
  });

  it("accepts a valid VIN", () => {
    expect(validateVin(VALID_VIN)).toEqual({
      valid: true,
      vin: VALID_VIN,
    });
  });
});

describe("vinSchema", () => {
  it("parses valid VINs and rejects invalid input", () => {
    expect(vinSchema.safeParse(VALID_VIN).success).toBe(true);
    expect(vinSchema.safeParse("invalid").success).toBe(false);
    expect(vinSchema.parse(`  ${VALID_VIN.toLowerCase()}  `)).toBe(VALID_VIN);
  });
});

describe("VIN_LENGTH", () => {
  it("is 17 per ISO 3779", () => {
    expect(VIN_LENGTH).toBe(17);
  });
});
