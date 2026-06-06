export type OtpRateLimitRecord = {
  verifyAttempts: number;
  resendAttempts: number;
  windowStartedAt: Date;
  cooldownUntil: Date | null;
};

export type RateLimitCheckResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "cooldown" | "verify_limit" | "resend_limit";
      retryAfter: Date;
    };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
export const MAX_VERIFY_ATTEMPTS_PER_HOUR = 3;
export const MAX_RESEND_ATTEMPTS_PER_HOUR = 3;

export function createEmptyRateLimitRecord(now: Date): OtpRateLimitRecord {
  return {
    verifyAttempts: 0,
    resendAttempts: 0,
    windowStartedAt: now,
    cooldownUntil: null,
  };
}

function isWindowExpired(windowStartedAt: Date, now: Date): boolean {
  return now.getTime() - windowStartedAt.getTime() >= HOUR_MS;
}

function resetWindow(
  record: OtpRateLimitRecord,
  now: Date,
): OtpRateLimitRecord {
  return {
    ...record,
    verifyAttempts: 0,
    resendAttempts: 0,
    windowStartedAt: now,
    cooldownUntil: null,
  };
}

export function normalizeRateLimitRecord(
  record: OtpRateLimitRecord,
  now: Date,
): OtpRateLimitRecord {
  if (record.cooldownUntil && now < record.cooldownUntil) {
    return record;
  }

  if (record.cooldownUntil && now >= record.cooldownUntil) {
    return createEmptyRateLimitRecord(now);
  }

  if (isWindowExpired(record.windowStartedAt, now)) {
    return resetWindow(record, now);
  }

  return record;
}

export function checkVerifyAllowed(
  record: OtpRateLimitRecord,
  now: Date,
): RateLimitCheckResult {
  const normalized = normalizeRateLimitRecord(record, now);

  if (normalized.cooldownUntil && now < normalized.cooldownUntil) {
    return {
      allowed: false,
      reason: "cooldown",
      retryAfter: normalized.cooldownUntil,
    };
  }

  if (normalized.verifyAttempts >= MAX_VERIFY_ATTEMPTS_PER_HOUR) {
    const retryAfter = new Date(normalized.windowStartedAt.getTime() + HOUR_MS);
    return {
      allowed: false,
      reason: "verify_limit",
      retryAfter,
    };
  }

  return { allowed: true };
}

export function checkResendAllowed(
  record: OtpRateLimitRecord,
  now: Date,
): RateLimitCheckResult {
  const normalized = normalizeRateLimitRecord(record, now);

  if (normalized.cooldownUntil && now < normalized.cooldownUntil) {
    return {
      allowed: false,
      reason: "cooldown",
      retryAfter: normalized.cooldownUntil,
    };
  }

  if (normalized.resendAttempts >= MAX_RESEND_ATTEMPTS_PER_HOUR) {
    const retryAfter = new Date(normalized.windowStartedAt.getTime() + HOUR_MS);
    return {
      allowed: false,
      reason: "resend_limit",
      retryAfter,
    };
  }

  return { allowed: true };
}

export function recordFailedVerify(
  record: OtpRateLimitRecord,
  now: Date,
): OtpRateLimitRecord {
  const normalized = normalizeRateLimitRecord(record, now);
  const verifyAttempts = normalized.verifyAttempts + 1;

  if (verifyAttempts >= MAX_VERIFY_ATTEMPTS_PER_HOUR) {
    return {
      ...normalized,
      verifyAttempts,
      cooldownUntil: new Date(now.getTime() + DAY_MS),
    };
  }

  return {
    ...normalized,
    verifyAttempts,
  };
}

export function recordResend(
  record: OtpRateLimitRecord,
  now: Date,
): OtpRateLimitRecord {
  const normalized = normalizeRateLimitRecord(record, now);

  return {
    ...normalized,
    resendAttempts: normalized.resendAttempts + 1,
  };
}

export function recordSuccessfulVerify(now: Date): OtpRateLimitRecord {
  return createEmptyRateLimitRecord(now);
}
