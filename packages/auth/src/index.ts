export {
  checkResendAllowed,
  checkVerifyAllowed,
  createEmptyRateLimitRecord,
  MAX_RESEND_ATTEMPTS_PER_HOUR,
  MAX_VERIFY_ATTEMPTS_PER_HOUR,
  normalizeRateLimitRecord,
  recordFailedVerify,
  recordResend,
  recordSuccessfulVerify,
  type OtpRateLimitRecord,
  type RateLimitCheckResult,
} from "./rate-limit";

export {
  advanceOnboardingStep,
  getOnboardingRoute,
  getPostAuthRedirect,
  isOnboardingComplete,
  resolveOnboardingStep,
  type ProfileOnboardingState,
} from "./onboarding";

export {
  canRetryIdentity,
  MAX_IDENTITY_ATTEMPTS,
  recordIdentityFailure,
  recordIdentitySuccess,
  shouldQueueManualReview,
  type IdentityState,
} from "./identity";

export { isValidUsPhone, maskPhone, normalizeUsPhone } from "./phone";

export {
  getLoginRedirectForSignupError,
  mapSupabaseAuthError,
  type AuthErrorCode,
} from "./errors";
