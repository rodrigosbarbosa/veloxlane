export type AuthErrorCode =
  | "email_exists"
  | "invalid_credentials"
  | "phone_taken"
  | "rate_limited"
  | "identity_manual_review"
  | "unknown";

export function mapSupabaseAuthError(message: string): AuthErrorCode {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  ) {
    return "email_exists";
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

  if (normalized.includes("rate") || normalized.includes("too many")) {
    return "rate_limited";
  }

  return "unknown";
}

export function getLoginRedirectForSignupError(code: AuthErrorCode): boolean {
  return code === "email_exists";
}
