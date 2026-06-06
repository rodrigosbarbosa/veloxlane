"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { advanceOnboardingStep } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { otpSchema, phoneSchema } from "@veloxlane/schemas";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { Field } from "@/components/auth/field";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import {
  clearVerifyPhoneStorage,
  readVerifyPhoneStorage,
  writeVerifyPhoneStorage,
} from "@/lib/auth/verify-phone-storage";
import { createClient } from "@/lib/supabase/client";

const phoneStepSchema = phoneSchema;
const otpStepSchema = otpSchema;

type PhoneStep = z.infer<typeof phoneStepSchema>;
type OtpStep = z.infer<typeof otpStepSchema>;

function formatRetryCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function VerifyPhoneForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [hydrated, setHydrated] = useState(false);
  const [phonePending, setPhonePending] = useState(false);
  const [otpPending, setOtpPending] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);
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

  useEffect(() => {
    const saved = readVerifyPhoneStorage();
    if (saved) {
      otpForm.setValue("phone", saved.phone);
      setStep("otp");
    }
    setHydrated(true);
  }, [otpForm]);

  useEffect(() => {
    if (step === "phone") {
      otpForm.clearErrors("token");
    }
  }, [step, otpForm]);

  useEffect(() => {
    if (retrySeconds === null || retrySeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetrySeconds((current) => {
        if (current === null || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retrySeconds]);

  const handleRateLimit = (retryAfterSeconds?: number) => {
    if (retryAfterSeconds && retryAfterSeconds > 0) {
      setRetrySeconds(retryAfterSeconds);
    }
    setStatus({
      tone: "error",
      message: copy.auth.errorRateLimited,
    });
  };

  const sendCode = phoneForm.handleSubmit(async (values) => {
    setPhonePending(true);
    setStatus(null);
    setRetrySeconds(null);
    const response = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone: values.phone }),
    });

    const payload = (await response.json()) as {
      message?: string;
      retryAfterSeconds?: number;
    };
    if (!response.ok) {
      if (response.status === 401) {
        router.push("/login?reason=sign-in-required");
        return;
      }

      if (response.status === 429) {
        handleRateLimit(payload.retryAfterSeconds);
        setPhonePending(false);
        return;
      }

      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      setPhonePending(false);
      return;
    }

    otpForm.setValue("phone", values.phone);
    writeVerifyPhoneStorage(values.phone);
    setStep("otp");
    setPhonePending(false);
    setStatus({ tone: "success", message: copy.auth.successCodeSent });
  });

  const verifyCode = otpForm.handleSubmit(async (values) => {
    setOtpPending(true);
    setStatus(null);
    setRetrySeconds(null);
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
      retryAfterSeconds?: number;
    };

    if (!response.ok) {
      if (response.status === 401) {
        router.push("/login?reason=sign-in-required");
        return;
      }

      if (response.status === 429) {
        handleRateLimit(payload.retryAfterSeconds);
        setOtpPending(false);
        return;
      }

      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      setOtpPending(false);
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

    clearVerifyPhoneStorage();
    setStatus({ tone: "success", message: copy.auth.successPhone });
    router.push(payload.next ?? "/");
  });

  const resendCode = async () => {
    const phone = otpForm.getValues("phone");
    if (!phone || retrySeconds !== null) {
      return;
    }

    setStatus(null);
    const response = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend", phone }),
    });

    const payload = (await response.json()) as {
      message?: string;
      retryAfterSeconds?: number;
    };

    if (!response.ok) {
      if (response.status === 401) {
        router.push("/login?reason=sign-in-required");
        return;
      }

      if (response.status === 429) {
        handleRateLimit(payload.retryAfterSeconds);
        return;
      }

      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      return;
    }

    setStatus({ tone: "success", message: copy.auth.successCodeSent });
  };

  if (!hydrated) {
    return <AuthFormSkeleton fields={1} />;
  }

  if (step === "phone") {
    if (phonePending) {
      return <AuthFormSkeleton fields={1} />;
    }

    return (
      <form className="flex flex-col gap-5" onSubmit={sendCode} noValidate>
        <Field
          autoComplete="tel"
          label={copy.auth.phoneLabel}
          type="tel"
          error={phoneForm.formState.errors.phone?.message}
          {...phoneForm.register("phone", {
            onChange: () => {
              otpForm.clearErrors("token");
              if (status?.tone === "error") {
                setStatus(null);
              }
            },
          })}
        />
        {status ? (
          <StatusMessage message={status.message} tone={status.tone} />
        ) : null}
        {retrySeconds !== null ? (
          <p className="auth-helper-text" role="status">
            {copy.auth.retryWaitPrefix} {formatRetryCountdown(retrySeconds)}
          </p>
        ) : null}
        <Button
          disabled={phoneForm.formState.isSubmitting || retrySeconds !== null}
          type="submit"
        >
          {copy.auth.submitPhone}
        </Button>
      </form>
    );
  }

  if (otpPending) {
    return <AuthFormSkeleton fields={1} />;
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
      {retrySeconds !== null ? (
        <p className="auth-helper-text" role="status">
          {copy.auth.retryWaitPrefix} {formatRetryCountdown(retrySeconds)}
        </p>
      ) : null}
      <Button
        disabled={otpForm.formState.isSubmitting || retrySeconds !== null}
        type="submit"
      >
        {copy.auth.submitOtp}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={retrySeconds !== null}
        onClick={() => void resendCode()}
      >
        {copy.auth.resendCode}
      </Button>
    </form>
  );
}
