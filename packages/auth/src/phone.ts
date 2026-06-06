const US_PHONE_PATTERN = /^\+1\d{10}$/;

export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (input.startsWith("+1") && digits.length === 11) {
    return `+${digits}`;
  }

  return null;
}

export function isValidUsPhone(input: string): boolean {
  const normalized = normalizeUsPhone(input);
  return normalized !== null && US_PHONE_PATTERN.test(normalized);
}

export function maskPhone(phone: string): string {
  const normalized = normalizeUsPhone(phone);
  if (!normalized) {
    return phone;
  }

  return `+1 (***) ***-${normalized.slice(-4)}`;
}
