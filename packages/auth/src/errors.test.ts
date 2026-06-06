import { describe, expect, it } from "vitest";

import { getLoginRedirectForSignupError, mapSupabaseAuthError } from "./errors";

describe("errors", () => {
  it("maps duplicate email errors", () => {
    expect(mapSupabaseAuthError("User already registered")).toBe(
      "email_exists",
    );
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

  it("maps rate limit errors", () => {
    expect(mapSupabaseAuthError("Too many requests")).toBe("rate_limited");
  });

  it("falls back to unknown", () => {
    expect(mapSupabaseAuthError("Something else")).toBe("unknown");
  });
});
