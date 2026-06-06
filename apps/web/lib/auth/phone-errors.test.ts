import { copy } from "@veloxlane/brand/copy";
import { describe, expect, it } from "vitest";

import {
  mapPhoneAuthMessage,
  parsePhoneSendFailureDetails,
} from "./phone-errors";

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

  it("maps Twilio provider auth failures on send, not OTP mismatch", () => {
    expect(
      mapPhoneAuthMessage(
        {
          message:
            "Error sending phone_change OTP to provider: Authenticate More information: https://www.twilio.com/docs/errors/20003",
          code: "sms_send_failed",
        },
        "send",
      ),
    ).toBe(copy.auth.errorPhoneSendFailed);
  });

  it("maps broad provider invalid-number errors to send failure, not format error", () => {
    expect(mapPhoneAuthMessage("Phone number is invalid", "send")).toBe(
      copy.auth.errorPhoneSendFailed,
    );
    expect(
      mapPhoneAuthMessage(
        "Error sending phone_change OTP to provider: Invalid 'To' Phone Number More information: https://www.twilio.com/docs/errors/21211",
        "send",
      ),
    ).toBe(copy.auth.errorPhoneSendFailed);
  });

  it("maps explicit phone format validation errors", () => {
    expect(mapPhoneAuthMessage("Invalid phone number format", "send")).toBe(
      "Enter a valid US phone number.",
    );
  });

  it("maps Twilio 21212 invalid Verify Service SID to send failure, not format error", () => {
    expect(
      mapPhoneAuthMessage(
        {
          message:
            "Error sending phone_change OTP to provider: Invalid From Number (caller ID): VAfab4d8272d9838d7759651db90dd085c More information: https://www.twilio.com/docs/errors/21212",
          code: "sms_send_failed",
        },
        "send",
      ),
    ).toBe(copy.auth.errorPhoneSendFailed);
  });

  it("does not treat provider invalid-number errors as user format errors", () => {
    expect(
      mapPhoneAuthMessage(
        "Error sending phone_change OTP to provider: Invalid 'To' Phone Number More information: https://www.twilio.com/docs/errors/21211",
        "send",
      ),
    ).toBe(copy.auth.errorPhoneSendFailed);
  });

  it("extracts Twilio 20003 diagnostics for server logs", () => {
    expect(
      parsePhoneSendFailureDetails({
        message:
          "Error sending phone_change OTP to provider: Authenticate More information: https://www.twilio.com/docs/errors/20003",
        code: "sms_send_failed",
      }),
    ).toEqual({
      supabaseCode: "sms_send_failed",
      supabaseMessage:
        "Error sending phone_change OTP to provider: Authenticate More information: https://www.twilio.com/docs/errors/20003",
      twilioErrorCode: "20003",
      hint: expect.stringContaining("Twilio Verify"),
    });
  });

  it("extracts Twilio 60200 diagnostics for server logs", () => {
    expect(
      parsePhoneSendFailureDetails({
        message:
          "Error sending phone_change OTP to provider: Invalid parameter More information: https://www.twilio.com/docs/errors/60200",
        code: "sms_send_failed",
      }),
    ).toEqual({
      supabaseCode: "sms_send_failed",
      supabaseMessage:
        "Error sending phone_change OTP to provider: Invalid parameter More information: https://www.twilio.com/docs/errors/60200",
      twilioErrorCode: "60200",
      hint: expect.stringContaining("60200"),
    });
  });

  it("extracts Twilio 30034 A2P 10DLC diagnostics for server logs", () => {
    expect(
      parsePhoneSendFailureDetails({
        message:
          "Error sending phone_change OTP to provider: US A2P 10DLC - Message from an Unregistered Number More information: https://www.twilio.com/docs/errors/30034",
        code: "sms_send_failed",
      }),
    ).toEqual({
      supabaseCode: "sms_send_failed",
      supabaseMessage:
        "Error sending phone_change OTP to provider: US A2P 10DLC - Message from an Unregistered Number More information: https://www.twilio.com/docs/errors/30034",
      twilioErrorCode: "30034",
      hint: expect.stringContaining("Twilio Verify"),
    });
  });
});
