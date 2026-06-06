import { describe, expect, it } from "vitest";

import {
  getLoginRedirectForSignupError,
  isSignupDuplicateUser,
  mapSupabaseAuthError,
} from "./errors";

describe("errors", () => {
  it("maps duplicate email errors", () => {
    expect(mapSupabaseAuthError("User already registered")).toBe(
      "email_exists",
    );
    expect(
      mapSupabaseAuthError({
        message: "User already registered",
        code: "user_already_exists",
      }),
    ).toBe("email_exists");
    expect(getLoginRedirectForSignupError("email_exists")).toBe(true);
  });

  it("maps invalid credential errors", () => {
    expect(mapSupabaseAuthError("Invalid login credentials")).toBe(
      "invalid_credentials",
    );
  });

  it("maps phone taken errors", () => {
    expect(mapSupabaseAuthError("Phone already exists")).toBe("phone_taken");
  });

  it("maps rate limit errors by message and code", () => {
    expect(mapSupabaseAuthError("Too many requests")).toBe("rate_limited");
    expect(mapSupabaseAuthError("429: email rate limit exceeded")).toBe(
      "rate_limited",
    );
    expect(
      mapSupabaseAuthError({
        message: "email rate limit exceeded",
        code: "over_email_send_rate_limit",
      }),
    ).toBe("rate_limited");
  });

  it("maps email not confirmed errors", () => {
    expect(
      mapSupabaseAuthError({
        message: "Email not confirmed",
        code: "email_not_confirmed",
      }),
    ).toBe("email_pending_confirmation");
  });

  it("detects duplicate signup users via empty identities", () => {
    expect(isSignupDuplicateUser([])).toBe(true);
    expect(isSignupDuplicateUser([{ id: "identity-1" }])).toBe(false);
    expect(isSignupDuplicateUser(undefined)).toBe(false);
  });

  it("falls back to unknown", () => {
    expect(mapSupabaseAuthError("Something else")).toBe("unknown");
  });
});
