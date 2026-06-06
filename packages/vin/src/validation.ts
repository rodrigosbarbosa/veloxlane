import { z } from "zod";

/** ISO 3779 — letters I, O, and Q are excluded from VINs. */
export const VIN_LENGTH = 17;

export const VIN_CHARSET_REGEX = /^[A-HJ-NPR-Z0-9]+$/;

const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};

const VIN_WEIGHTS = [
  8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2,
] as const;

export type VinValidationErrorCode =
  | "empty"
  | "invalid_length"
  | "invalid_characters"
  | "invalid_check_digit";

export type VinValidationResult =
  | { valid: true; vin: string }
  | { valid: false; code: VinValidationErrorCode; message: string };

export const vinSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => value.length === VIN_LENGTH, {
    message: "VIN must be exactly 17 characters.",
  })
  .refine((value) => VIN_CHARSET_REGEX.test(value), {
    message: "VIN cannot include the letters I, O, or Q.",
  })
  .refine((value) => isVinCheckDigitValid(value), {
    message: "VIN check digit does not match.",
  });

export function normalizeVinInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, VIN_LENGTH);
}

export function formatVinDisplay(value: string): string {
  const normalized = normalizeVinInput(value);
  const first = normalized.slice(0, 3);
  const middle = normalized.slice(3, 9);
  const last = normalized.slice(9);
  const parts = [first, middle, last].filter((part) => part.length > 0);
  return parts.join(" ");
}

function vinCharValue(char: string): number | null {
  if (/[0-9]/.test(char)) {
    return Number.parseInt(char, 10);
  }

  return VIN_TRANSLITERATION[char] ?? null;
}

export function computeVinCheckDigit(vin: string): string {
  const normalized = normalizeVinInput(vin);

  if (normalized.length !== VIN_LENGTH) {
    return "";
  }

  let sum = 0;

  for (let index = 0; index < VIN_LENGTH; index += 1) {
    const value = vinCharValue(normalized[index] ?? "") ?? 0;
    sum += value * (VIN_WEIGHTS[index] ?? 0);
  }

  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export function isVinCheckDigitValid(vin: string): boolean {
  const normalized = normalizeVinInput(vin);

  if (normalized.length !== VIN_LENGTH || !VIN_CHARSET_REGEX.test(normalized)) {
    return false;
  }

  const expected = computeVinCheckDigit(normalized);
  return normalized[8] === expected;
}

export function validateVin(value: string): VinValidationResult {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (raw.length === 0) {
    return {
      valid: false,
      code: "empty",
      message: "Enter your 17-character VIN.",
    };
  }

  if (/[IOQ]/.test(raw)) {
    return {
      valid: false,
      code: "invalid_characters",
      message: "VIN cannot include the letters I, O, or Q.",
    };
  }

  const normalized = normalizeVinInput(value);

  if (normalized.length !== VIN_LENGTH) {
    return {
      valid: false,
      code: "invalid_length",
      message: `VIN must be ${VIN_LENGTH} characters (${normalized.length} so far).`,
    };
  }

  if (!isVinCheckDigitValid(normalized)) {
    return {
      valid: false,
      code: "invalid_check_digit",
      message:
        "That VIN does not pass the check-digit test. Double-check and try again.",
    };
  }

  return { valid: true, vin: normalized };
}
