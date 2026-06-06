import type { OnboardingStep, UserRole } from "@veloxlane/schemas";

export type MockProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  phone_verified: boolean;
  id_verified: boolean;
  onboarding_step: OnboardingStep;
  identity_attempts: number;
  identity_manual_review: boolean;
};

export type OtpRateLimit = {
  verify_attempts: number;
  resend_attempts: number;
  window_started_at: string;
  cooldown_until: string | null;
};

export type MockAuthState = {
  userId: string;
  accessToken: string;
  profile: MockProfile | null;
  otpLimits: Map<string, OtpRateLimit>;
  stripeShouldFail: boolean;
};

export function createMockAuthState(): MockAuthState {
  return {
    userId: "test-user-00000000-0000-0000-0000-000000000001",
    accessToken: "mock-access-token",
    profile: null,
    otpLimits: new Map(),
    stripeShouldFail: false,
  };
}

export function getOrCreateOtpLimit(
  state: MockAuthState,
  phone: string,
): OtpRateLimit {
  const existing = state.otpLimits.get(phone);
  if (existing) {
    return existing;
  }

  const record: OtpRateLimit = {
    verify_attempts: 0,
    resend_attempts: 0,
    window_started_at: new Date().toISOString(),
    cooldown_until: null,
  };
  state.otpLimits.set(phone, record);
  return record;
}
