import { describe, expect, it } from "vitest";

import {
  authClaimsSchema,
  emailSignInStartRequestSchema,
  phoneOtpVerifyRequestSchema,
} from "./auth";

describe("auth schemas", () => {
  it("normalizes email sign-in requests", () => {
    const request = emailSignInStartRequestSchema.parse({
      email: " Founder@VeloxLane.TEST ",
    });

    expect(request).toEqual({
      email: "founder@veloxlane.test",
    });
  });

  it("accepts E.164 phone and digit-only OTP codes", () => {
    const request = phoneOtpVerifyRequestSchema.parse({
      phone: "+15551234567",
      code: "123456",
    });

    expect(request).toEqual({
      phone: "+15551234567",
      code: "123456",
    });
  });

  it("rejects public claims with staff-only permissions", () => {
    const result = authClaimsSchema.safeParse({
      subject: "user_123",
      role: "public",
      providers: ["email"],
      emailVerified: true,
      phoneVerified: false,
      permissions: ["admin:list"],
    });

    expect(result.success).toBe(false);
  });
});
