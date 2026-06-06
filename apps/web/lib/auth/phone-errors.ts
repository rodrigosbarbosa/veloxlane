import { mapSupabaseAuthError } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";

export type PhoneAuthAction = "send" | "resend" | "verify";

export function mapPhoneAuthMessage(
  message: string,
  action: PhoneAuthAction,
): string {
  const normalized = message.toLowerCase();
  const code = mapSupabaseAuthError(message);

  if (
    code === "phone_taken" ||
    (normalized.includes("phone") && normalized.includes("already"))
  ) {
    return copy.auth.errorPhoneTaken;
  }

  if (code === "rate_limited") {
    return copy.auth.errorRateLimited;
  }

  if (action === "verify") {
    if (
      normalized.includes("otp") ||
      normalized.includes("token") ||
      (normalized.includes("invalid") && normalized.includes("code")) ||
      normalized.includes("expired")
    ) {
      return copy.auth.errorInvalidOtp;
    }

    return copy.auth.errorGeneric;
  }

  if (
    normalized.includes("invalid") &&
    (normalized.includes("phone") || normalized.includes("number"))
  ) {
    return "Enter a valid US phone number.";
  }

  return copy.auth.errorPhoneSendFailed;
}
