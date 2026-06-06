import { copy } from "@veloxlane/brand/copy";
import { describe, expect, it } from "vitest";

import { mapPhoneAuthMessage } from "./phone-errors";

describe("mapPhoneAuthMessage", () => {
  it("maps send failures with code wording to phone send copy, not OTP mismatch", () => {
    expect(
      mapPhoneAuthMessage(
        "Error sending confirmation code to provider",
        "send",
      ),
    ).toBe(copy.auth.errorPhoneSendFailed);
  });

  it("maps verify OTP mismatch to invalid OTP copy", () => {
    expect(
      mapPhoneAuthMessage("Token has expired or is invalid", "verify"),
    ).toBe(copy.auth.errorInvalidOtp);
  });

  it("maps resend rate limits consistently", () => {
    expect(mapPhoneAuthMessage("Too many requests", "resend")).toBe(
      copy.auth.errorRateLimited,
    );
  });

  it("maps phone taken on send", () => {
    expect(mapPhoneAuthMessage("Phone number already registered", "send")).toBe(
      copy.auth.errorPhoneTaken,
    );
  });
});
