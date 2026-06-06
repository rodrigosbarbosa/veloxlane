import { describe, expect, it } from "vitest";

import { mapSignupAuthMessage } from "./signup-errors";

describe("mapSignupAuthMessage", () => {
  it("maps rate limit errors to the rate-limited copy", () => {
    expect(
      mapSignupAuthMessage({
        message: "429: email rate limit exceeded",
        code: "over_email_send_rate_limit",
      }),
    ).toMatch(/Too many attempts/);
  });

  it("maps duplicate email errors to the email-exists copy", () => {
    expect(
      mapSignupAuthMessage({
        message: "User already registered",
        code: "user_already_exists",
      }),
    ).toMatch(/already has a lane/);
  });
});
