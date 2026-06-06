export type AuthErrorCode =
  | "email_exists"
  | "email_pending_confirmation"
  | "invalid_credentials"
  | "phone_taken"
  | "rate_limited"
  | "identity_manual_review"
  | "unknown";

export type SupabaseAuthErrorInput = {
  message: string;
  code?: string;
};

export function mapSupabaseAuthError(
  message: string,
  code?: string,
): AuthErrorCode;
export function mapSupabaseAuthError(
  error: SupabaseAuthErrorInput,
): AuthErrorCode;
export function mapSupabaseAuthError(
  messageOrError: string | SupabaseAuthErrorInput,
  code?: string,
): AuthErrorCode {
  const message =
    typeof messageOrError === "string"
      ? messageOrError
      : messageOrError.message;
  const errorCode =
    typeof messageOrError === "string" ? code : messageOrError.code;
  const normalized = message.toLowerCase();
  const normalizedCode = errorCode?.toLowerCase() ?? "";

  if (
    normalizedCode === "over_email_send_rate_limit" ||
    normalizedCode === "email_rate_limit_exceeded" ||
    normalizedCode === "over_request_rate_limit"
  ) {
    return "rate_limited";
  }

  if (
    normalizedCode === "user_already_exists" ||
    normalizedCode === "email_exists"
  ) {
    return "email_exists";
  }

  if (normalizedCode === "email_not_confirmed") {
    return "email_pending_confirmation";
  }

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  ) {
    return "email_exists";
  }

  if (
    normalized.includes("email not confirmed") ||
    normalized.includes("email address not confirmed")
  ) {
    return "email_pending_confirmation";
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid email or password")
  ) {
    return "invalid_credentials";
  }

  if (normalized.includes("phone") && normalized.includes("already")) {
    return "phone_taken";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many") ||
    normalized.includes("rate")
  ) {
    return "rate_limited";
  }

  return "unknown";
}

/** Confirmed account already exists (Supabase returns empty identities). */
export function isSignupDuplicateUser(
  identities: { id: string }[] | null | undefined,
): boolean {
  return identities?.length === 0;
}

export function getLoginRedirectForSignupError(code: AuthErrorCode): boolean {
  return code === "email_exists";
}
