import { mapSupabaseAuthError } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";

export type PhoneAuthAction = "send" | "resend" | "verify";

export type PhoneAuthErrorInput = {
  message: string;
  code?: string;
};

function isSmsProviderFailure(
  normalizedMessage: string,
  errorCode?: string,
): boolean {
  const normalizedCode = errorCode?.toLowerCase() ?? "";

  return (
    normalizedCode === "sms_send_failed" ||
    normalizedMessage.includes("to provider") ||
    normalizedMessage.includes("twilio") ||
    normalizedMessage.includes("authenticate")
  );
}

export function mapPhoneAuthMessage(
  message: string,
  action: PhoneAuthAction,
  errorCode?: string,
): string;
export function mapPhoneAuthMessage(
  error: PhoneAuthErrorInput,
  action: PhoneAuthAction,
): string;
export function mapPhoneAuthMessage(
  messageOrError: string | PhoneAuthErrorInput,
  action: PhoneAuthAction,
  errorCode?: string,
): string {
  const message =
    typeof messageOrError === "string"
      ? messageOrError
      : messageOrError.message;
  const resolvedCode =
    typeof messageOrError === "string" ? errorCode : messageOrError.code;
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

  if (isSmsProviderFailure(normalized, resolvedCode)) {
    return copy.auth.errorPhoneSendFailed;
  }

  return copy.auth.errorPhoneSendFailed;
}
