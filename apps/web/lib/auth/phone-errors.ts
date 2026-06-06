import { mapSupabaseAuthError } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";

export function mapPhoneAuthMessage(message: string): string {
  const code = mapSupabaseAuthError(message);

  if (code === "phone_taken") {
    return copy.auth.errorPhoneTaken;
  }

  if (code === "rate_limited") {
    return copy.auth.errorRateLimited;
  }

  const normalized = message.toLowerCase();
  if (
    normalized.includes("otp") ||
    normalized.includes("token") ||
    normalized.includes("code") ||
    normalized.includes("expired")
  ) {
    return copy.auth.errorInvalidOtp;
  }

  return copy.auth.errorGeneric;
}
