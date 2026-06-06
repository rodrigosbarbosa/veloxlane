import type { OnboardingStep, UserRole } from "@veloxlane/schemas";

export type ProfileOnboardingState = {
  onboardingStep: OnboardingStep;
  role: UserRole | "user" | "admin" | "staff";
  phoneVerified: boolean;
  idVerified: boolean;
  identityManualReview: boolean;
};

const STEP_ROUTES = {
  web: {
    signup: "/signup",
    phone: "/verify-phone",
    identity: "/verify-id",
    complete: "/",
  },
  mobile: {
    signup: "/(onboarding)/sign-up",
    phone: "/(onboarding)/phone-verify",
    identity: "/(onboarding)/id-verify",
    complete: "/(onboarding)/welcome",
  },
} as const;

export function getOnboardingRoute(
  step: OnboardingStep,
  platform: "web" | "mobile",
): string {
  return STEP_ROUTES[platform][step];
}

export function resolveOnboardingStep(
  profile: ProfileOnboardingState,
): OnboardingStep {
  if (profile.onboardingStep === "signup") {
    return "signup";
  }

  if (!profile.phoneVerified) {
    return "phone";
  }

  if (profile.role === "seller" && !profile.idVerified) {
    return "identity";
  }

  return "complete";
}

export function getPostAuthRedirect(
  profile: ProfileOnboardingState,
  platform: "web" | "mobile",
): string {
  const step = resolveOnboardingStep(profile);

  if (step === "complete") {
    return platform === "web" ? "/" : "/(tabs)/browse";
  }

  return getOnboardingRoute(step, platform);
}

export function advanceOnboardingStep(
  current: OnboardingStep,
  role: UserRole,
  event: "signup_complete" | "phone_verified" | "identity_verified",
): OnboardingStep {
  if (event === "signup_complete") {
    return "phone";
  }

  if (event === "phone_verified") {
    return role === "seller" ? "identity" : "complete";
  }

  if (event === "identity_verified") {
    return "complete";
  }

  return current;
}

export function isOnboardingComplete(profile: ProfileOnboardingState): boolean {
  return resolveOnboardingStep(profile) === "complete";
}
