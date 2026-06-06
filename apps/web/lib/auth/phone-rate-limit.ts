import {
  checkResendAllowed,
  checkVerifyAllowed,
  createEmptyRateLimitRecord,
  normalizeRateLimitRecord,
  recordFailedVerify,
  recordResend,
  recordSuccessfulVerify,
  type OtpRateLimitRecord,
} from "@veloxlane/auth";

import { createServiceClient } from "@/lib/supabase/server";

function toRecord(row: {
  verify_attempts: number;
  resend_attempts: number;
  window_started_at: string;
  cooldown_until: string | null;
}): OtpRateLimitRecord {
  return {
    verifyAttempts: row.verify_attempts,
    resendAttempts: row.resend_attempts,
    windowStartedAt: new Date(row.window_started_at),
    cooldownUntil: row.cooldown_until ? new Date(row.cooldown_until) : null,
  };
}

function toRow(record: OtpRateLimitRecord) {
  return {
    verify_attempts: record.verifyAttempts,
    resend_attempts: record.resendAttempts,
    window_started_at: record.windowStartedAt.toISOString(),
    cooldown_until: record.cooldownUntil?.toISOString() ?? null,
  };
}

async function loadRecord(phone: string): Promise<OtpRateLimitRecord> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("auth_phone_rate_limits")
    .select(
      "verify_attempts, resend_attempts, window_started_at, cooldown_until",
    )
    .eq("phone", phone)
    .maybeSingle();

  if (!data) {
    return createEmptyRateLimitRecord(new Date());
  }

  return normalizeRateLimitRecord(toRecord(data), new Date());
}

async function saveRecord(
  phone: string,
  record: OtpRateLimitRecord,
): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("auth_phone_rate_limits").upsert({
    phone,
    ...toRow(record),
  });
}

export async function assertPhoneAvailable(phone: string, userId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .eq("phone_verified", true)
    .neq("id", userId)
    .maybeSingle();

  return !data;
}

export async function canSendOtp(phone: string) {
  const now = new Date();
  const record = await loadRecord(phone);
  return checkResendAllowed(record, now);
}

export async function canVerifyOtp(phone: string) {
  const now = new Date();
  const record = await loadRecord(phone);
  return checkVerifyAllowed(record, now);
}

export async function markOtpResent(phone: string) {
  const now = new Date();
  const record = recordResend(await loadRecord(phone), now);
  await saveRecord(phone, record);
}

export async function markOtpFailed(phone: string) {
  const now = new Date();
  const record = recordFailedVerify(await loadRecord(phone), now);
  await saveRecord(phone, record);
}

export async function markOtpVerified(phone: string) {
  const now = new Date();
  const record = recordSuccessfulVerify(now);
  await saveRecord(phone, record);
}
