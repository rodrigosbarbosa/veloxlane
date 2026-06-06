"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  advanceOnboardingStep,
  isSignupDuplicateUser,
  mapSupabaseAuthError,
} from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { signupSchema, type SignupInput } from "@veloxlane/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { Field } from "@/components/auth/field";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import {
  mapSignupAuthMessage,
  shouldRedirectSignupToLogin,
} from "@/lib/auth/signup-errors";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    setStatus(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: values.role,
        },
      },
    });

    if (error) {
      const code = mapSupabaseAuthError({
        message: error.message,
        code: error.code,
      });

      if (shouldRedirectSignupToLogin(code)) {
        router.push(
          `/login?email=${encodeURIComponent(values.email)}&reason=email-exists`,
        );
        return;
      }

      setStatus({
        tone: "error",
        message: mapSignupAuthMessage({
          message: error.message,
          code: error.code,
        }),
      });
      setPending(false);
      return;
    }

    if (isSignupDuplicateUser(data.user?.identities)) {
      router.push(
        `/login?email=${encodeURIComponent(values.email)}&reason=email-exists`,
      );
      return;
    }

    if (!data.user) {
      setStatus({ tone: "error", message: copy.auth.errorGeneric });
      setPending(false);
      return;
    }

    if (!data.session) {
      setStatus({
        tone: "success",
        message: copy.auth.successSignupConfirmEmail,
      });
      setPending(false);
      return;
    }

    const nextStep = advanceOnboardingStep(
      "signup",
      values.role,
      "signup_complete",
    );

    await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        role: values.role,
        onboarding_step: nextStep,
      })
      .eq("id", data.user.id);

    await fetch("/api/auth/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        fullName: values.fullName,
      }),
    });

    setStatus({ tone: "success", message: copy.auth.successSignup });
    router.push("/verify-phone");
  });

  if (pending) {
    return <AuthFormSkeleton fields={4} />;
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <Field
        autoComplete="name"
        label={copy.auth.fullNameLabel}
        type="text"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Field
        autoComplete="email"
        label={copy.auth.emailLabel}
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        autoComplete="new-password"
        label={copy.auth.passwordLabel}
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        autoComplete="new-password"
        label={copy.auth.confirmPasswordLabel}
        type="password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <fieldset className="space-y-2">
        <legend className="auth-field-label text-sm">
          {copy.auth.roleLabel}
        </legend>
        <div className="flex gap-3">
          <label className="auth-helper-text flex items-center gap-2">
            <input type="radio" value="buyer" {...register("role")} />
            {copy.auth.roleBuyer}
          </label>
          <label className="auth-helper-text flex items-center gap-2">
            <input type="radio" value="seller" {...register("role")} />
            {copy.auth.roleSeller}
          </label>
        </div>
      </fieldset>
      {status ? (
        <StatusMessage message={status.message} tone={status.tone} />
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? copy.auth.loading : copy.auth.submitSignup}
      </Button>
      <p className="auth-helper-text">
        <Link className="auth-inline-link" href="/login">
          {copy.auth.backToLogin}
        </Link>
      </p>
    </form>
  );
}
