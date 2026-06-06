"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { advanceOnboardingStep } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { otpSchema, phoneSchema } from "@veloxlane/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/auth/field";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const phoneStepSchema = phoneSchema;
const otpStepSchema = otpSchema;

type PhoneStep = z.infer<typeof phoneStepSchema>;
type OtpStep = z.infer<typeof otpStepSchema>;

export function VerifyPhoneForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);
  const phoneForm = useForm<PhoneStep>({
    resolver: zodResolver(phoneStepSchema),
  });
  const otpForm = useForm<OtpStep>({
    resolver: zodResolver(otpStepSchema),
  });

  const sendCode = phoneForm.handleSubmit(async (values) => {
    setStatus(null);
    const response = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone: values.phone }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      return;
    }

    otpForm.setValue("phone", values.phone);
    setStep("otp");
    setStatus({ tone: "success", message: "Code sent." });
  });

  const verifyCode = otpForm.handleSubmit(async (values) => {
    setStatus(null);
    const response = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        phone: values.phone,
        token: values.token,
      }),
    });

    const payload = (await response.json()) as {
      message?: string;
      next?: string;
    };

    if (!response.ok) {
      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role === "seller" ? "seller" : "buyer";
      const nextStep = advanceOnboardingStep("phone", role, "phone_verified");

      await supabase
        .from("profiles")
        .update({
          phone: values.phone,
          phone_verified: true,
          onboarding_step: nextStep,
        })
        .eq("id", user.id);
    }

    setStatus({ tone: "success", message: copy.auth.successPhone });
    router.push(payload.next ?? "/");
  });

  const resendCode = async () => {
    const phone = otpForm.getValues("phone");
    if (!phone) {
      return;
    }

    await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend", phone }),
    });
  };

  if (step === "phone") {
    return (
      <form className="flex flex-col gap-5" onSubmit={sendCode} noValidate>
        <Field
          autoComplete="tel"
          label={copy.auth.phoneLabel}
          type="tel"
          error={phoneForm.formState.errors.phone?.message}
          {...phoneForm.register("phone")}
        />
        {status ? (
          <StatusMessage message={status.message} tone={status.tone} />
        ) : null}
        <Button disabled={phoneForm.formState.isSubmitting} type="submit">
          {phoneForm.formState.isSubmitting
            ? copy.auth.loading
            : copy.auth.submitPhone}
        </Button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={verifyCode} noValidate>
      <Field
        inputMode="numeric"
        label={copy.auth.otpLabel}
        maxLength={6}
        error={otpForm.formState.errors.token?.message}
        {...otpForm.register("token")}
      />
      {status ? (
        <StatusMessage message={status.message} tone={status.tone} />
      ) : null}
      <Button disabled={otpForm.formState.isSubmitting} type="submit">
        {otpForm.formState.isSubmitting
          ? copy.auth.loading
          : copy.auth.submitOtp}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void resendCode()}
      >
        {copy.auth.resendCode}
      </Button>
    </form>
  );
}
