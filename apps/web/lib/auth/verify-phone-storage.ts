const STORAGE_KEY = "veloxlane:verify-phone";

export type VerifyPhoneStorage = {
  step: "otp";
  phone: string;
};

export function readVerifyPhoneStorage(): VerifyPhoneStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as VerifyPhoneStorage;
    if (parsed.step === "otp" && typeof parsed.phone === "string") {
      return parsed;
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

export function writeVerifyPhoneStorage(phone: string): void {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ step: "otp", phone } satisfies VerifyPhoneStorage),
  );
}

export function clearVerifyPhoneStorage(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
