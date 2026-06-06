import { describe, expect, it } from "vitest";

import {
  checkResendAllowed,
  checkVerifyAllowed,
  createEmptyRateLimitRecord,
  MAX_VERIFY_ATTEMPTS_PER_HOUR,
  normalizeRateLimitRecord,
  recordFailedVerify,
  recordResend,
  recordSuccessfulVerify,
} from "./rate-limit";

const baseTime = new Date("2026-06-05T12:00:00.000Z");

describe("rate-limit", () => {
  it("allows verify when under the hourly cap", () => {
    const record = createEmptyRateLimitRecord(baseTime);
    expect(checkVerifyAllowed(record, baseTime)).toEqual({ allowed: true });
  });

  it("blocks verify after three failed attempts with cooldown", () => {
    let record = createEmptyRateLimitRecord(baseTime);
    record = recordFailedVerify(record, baseTime);
    record = recordFailedVerify(record, baseTime);
    record = recordFailedVerify(record, baseTime);

    const result = checkVerifyAllowed(record, baseTime);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("cooldown");
    }
  });

  it("resets the window after one hour", () => {
    const record = {
      verifyAttempts: MAX_VERIFY_ATTEMPTS_PER_HOUR,
      resendAttempts: 1,
      windowStartedAt: baseTime,
      cooldownUntil: null,
    };
    const later = new Date(baseTime.getTime() + 60 * 60 * 1000 + 1);
    const normalized = normalizeRateLimitRecord(record, later);

    expect(normalized.verifyAttempts).toBe(0);
    expect(normalized.resendAttempts).toBe(0);
  });

  it("clears cooldown after 24 hours", () => {
    const cooldownUntil = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
    const record = {
      verifyAttempts: 3,
      resendAttempts: 0,
      windowStartedAt: baseTime,
      cooldownUntil,
    };
    const afterCooldown = new Date(cooldownUntil.getTime() + 1);
    const normalized = normalizeRateLimitRecord(record, afterCooldown);
    expect(normalized.cooldownUntil).toBeNull();
  });

  it("limits resend attempts separately", () => {
    let record = createEmptyRateLimitRecord(baseTime);
    record = recordResend(record, baseTime);
    record = recordResend(record, baseTime);
    record = recordResend(record, baseTime);

    const result = checkResendAllowed(record, baseTime);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("resend_limit");
    }
  });

  it("clears limits after successful verification", () => {
    const record = recordSuccessfulVerify(baseTime);
    expect(record.verifyAttempts).toBe(0);
    expect(record.cooldownUntil).toBeNull();
  });

  it("returns verify_limit when attempts equal cap without cooldown", () => {
    const record = {
      verifyAttempts: MAX_VERIFY_ATTEMPTS_PER_HOUR,
      resendAttempts: 0,
      windowStartedAt: baseTime,
      cooldownUntil: null,
    };

    const result = checkVerifyAllowed(record, baseTime);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("verify_limit");
    }
  });

  it("blocks resend during cooldown", () => {
    const cooldownUntil = new Date(baseTime.getTime() + 60 * 60 * 1000);
    const record = {
      verifyAttempts: 0,
      resendAttempts: 0,
      windowStartedAt: baseTime,
      cooldownUntil,
    };
    const result = checkResendAllowed(record, baseTime);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("cooldown");
    }
  });

  it("returns verify_limit at exactly max attempts", () => {
    const record = {
      verifyAttempts: MAX_VERIFY_ATTEMPTS_PER_HOUR - 1,
      resendAttempts: 0,
      windowStartedAt: baseTime,
      cooldownUntil: null,
    };
    const failed = recordFailedVerify(record, baseTime);
    const result = checkVerifyAllowed(failed, baseTime);
    expect(result.allowed).toBe(false);
  });
});
