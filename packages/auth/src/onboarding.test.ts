import { describe, expect, it } from "vitest";

import {
  advanceOnboardingStep,
  getOnboardingRoute,
  getPostAuthRedirect,
  isOnboardingComplete,
  resolveOnboardingStep,
} from "./onboarding";

describe("onboarding", () => {
  it("routes buyers to phone verification after signup", () => {
    expect(advanceOnboardingStep("signup", "buyer", "signup_complete")).toBe(
      "phone",
    );
  });

  it("routes sellers to identity after phone verification", () => {
    expect(advanceOnboardingStep("phone", "seller", "phone_verified")).toBe(
      "identity",
    );
  });

  it("completes buyer onboarding after phone verification", () => {
    expect(advanceOnboardingStep("phone", "buyer", "phone_verified")).toBe(
      "complete",
    );
  });

  it("resumes abandoned seller flow at phone step", () => {
    const step = resolveOnboardingStep({
      onboardingStep: "identity",
      role: "seller",
      phoneVerified: false,
      idVerified: false,
      identityManualReview: false,
    });

    expect(step).toBe("phone");
  });

  it("redirects completed buyers to home on web", () => {
    const redirect = getPostAuthRedirect(
      {
        onboardingStep: "complete",
        role: "buyer",
        phoneVerified: true,
        idVerified: false,
        identityManualReview: false,
      },
      "web",
    );

    expect(redirect).toBe("/");
  });

  it("redirects sellers needing identity on mobile", () => {
    const redirect = getPostAuthRedirect(
      {
        onboardingStep: "phone",
        role: "seller",
        phoneVerified: true,
        idVerified: false,
        identityManualReview: false,
      },
      "mobile",
    );

    expect(redirect).toBe("/(onboarding)/id-verify");
  });

  it("detects completed onboarding", () => {
    expect(
      isOnboardingComplete({
        onboardingStep: "complete",
        role: "buyer",
        phoneVerified: true,
        idVerified: false,
        identityManualReview: false,
      }),
    ).toBe(true);
  });

  it("exposes onboarding routes", () => {
    expect(getOnboardingRoute("phone", "web")).toBe("/verify-phone");
    expect(getOnboardingRoute("signup", "mobile")).toBe(
      "/(onboarding)/sign-up",
    );
  });

  it("marks identity verification as complete", () => {
    expect(
      advanceOnboardingStep("identity", "seller", "identity_verified"),
    ).toBe("complete");
  });

  it("keeps current step for unknown events", () => {
    expect(advanceOnboardingStep("phone", "buyer", "signup_complete")).toBe(
      "phone",
    );
  });

  it("returns signup when profile is still at signup", () => {
    expect(
      resolveOnboardingStep({
        onboardingStep: "signup",
        role: "buyer",
        phoneVerified: false,
        idVerified: false,
        identityManualReview: false,
      }),
    ).toBe("signup");
  });
});
