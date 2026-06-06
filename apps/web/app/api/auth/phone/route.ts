import { advanceOnboardingStep, normalizeUsPhone } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { NextResponse } from "next/server";
import { z } from "zod";

import { mapPhoneAuthMessage } from "@/lib/auth/phone-errors";
import {
  assertPhoneAvailable,
  canSendOtp,
  canVerifyOtp,
  markOtpFailed,
  markOtpResent,
  markOtpVerified,
} from "@/lib/auth/phone-rate-limit";
import { getPostAuthPath } from "@/lib/auth/profile";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), phone: z.string() }),
  z.object({ action: z.literal("resend"), phone: z.string() }),
  z.object({
    action: z.literal("verify"),
    phone: z.string(),
    token: z.string().length(6),
  }),
]);

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const normalized = normalizeUsPhone(parsed.data.phone);
  if (!normalized) {
    return NextResponse.json(
      { message: "Enter a valid US phone number." },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: copy.auth.errorSignInRequired },
      { status: 401 },
    );
  }

  const phoneAvailable = await assertPhoneAvailable(normalized, user.id);
  if (!phoneAvailable) {
    return NextResponse.json(
      { message: copy.auth.errorPhoneTaken },
      { status: 409 },
    );
  }

  if (parsed.data.action === "send" || parsed.data.action === "resend") {
    const allowed = await canSendOtp(normalized);
    if (!allowed.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((allowed.retryAfter.getTime() - Date.now()) / 1000),
      );
      return NextResponse.json(
        { message: copy.auth.errorRateLimited, retryAfterSeconds },
        { status: 429 },
      );
    }

    const { error } = await supabase.auth.updateUser({ phone: normalized });
    if (error) {
      console.error("[auth/phone] updateUser failed", {
        action: parsed.data.action,
        code: error.code,
        message: error.message,
        userId: user.id,
      });
      return NextResponse.json(
        {
          message: mapPhoneAuthMessage(
            { message: error.message, code: error.code },
            parsed.data.action,
          ),
        },
        { status: 400 },
      );
    }

    await markOtpResent(normalized);
    return NextResponse.json({ ok: true });
  }

  const verifyAllowed = await canVerifyOtp(normalized);
  if (!verifyAllowed.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((verifyAllowed.retryAfter.getTime() - Date.now()) / 1000),
    );
    return NextResponse.json(
      { message: copy.auth.errorRateLimited, retryAfterSeconds },
      { status: 429 },
    );
  }

  const { error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: parsed.data.token,
    type: "phone_change",
  });

  if (error) {
    await markOtpFailed(normalized);
    console.error("[auth/phone] verifyOtp failed", {
      code: error.code,
      message: error.message,
      userId: user.id,
    });
    return NextResponse.json(
      {
        message: mapPhoneAuthMessage(
          { message: error.message, code: error.code },
          "verify",
        ),
      },
      { status: 400 },
    );
  }

  await markOtpVerified(normalized);

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role === "seller" ? "seller" : "buyer";
  const nextStep = advanceOnboardingStep("phone", role, "phone_verified");

  await service
    .from("profiles")
    .update({
      phone: normalized,
      phone_verified: true,
      onboarding_step: nextStep,
    })
    .eq("id", user.id);

  const next = await getPostAuthPath();
  return NextResponse.json({ ok: true, next });
}
