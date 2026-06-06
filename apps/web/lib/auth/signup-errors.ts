import {
  mapSupabaseAuthError,
  type AuthErrorCode,
  type SupabaseAuthErrorInput,
} from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";

export function mapSignupAuthMessage(error: SupabaseAuthErrorInput): string {
  const code = mapSupabaseAuthError(error);

  switch (code) {
    case "email_exists":
      return copy.auth.errorEmailExists;
    case "email_pending_confirmation":
      return copy.auth.errorEmailPendingConfirmation;
    case "rate_limited":
      return copy.auth.errorRateLimited;
    case "phone_taken":
      return copy.auth.errorPhoneTaken;
    case "invalid_credentials":
      return copy.auth.errorInvalidCredentials;
    default:
      return copy.auth.errorGeneric;
  }
}

export function shouldRedirectSignupToLogin(code: AuthErrorCode): boolean {
  return code === "email_exists";
}
