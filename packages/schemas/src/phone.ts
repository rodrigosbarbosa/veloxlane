const US_PHONE_PATTERN = /^\+1\d{10}$/;

/** Strip to national digits (10) or leading-1 + 10 digits for display formatting. */
function extractUsPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits.slice(0, 10);
}

/** Formats partial or complete US input as (XXX) XXX-XXXX while typing. */
export function formatPhoneInput(input: string): string {
  const digits = extractUsPhoneDigits(input);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

export function isValidUsPhone(input: string): boolean {
  const normalized = normalizeUsPhone(input);
  return normalized !== null && US_PHONE_PATTERN.test(normalized);
}

/** Alias for {@link isValidUsPhone}. */
export const validateUsPhone = isValidUsPhone;

export function maskPhone(phone: string): string {
  const normalized = normalizeUsPhone(phone);
  if (!normalized) {
    return phone;
  }

  return `+1 (***) ***-${normalized.slice(-4)}`;
}
