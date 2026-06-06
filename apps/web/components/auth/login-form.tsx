"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { advanceOnboardingStep, mapSupabaseAuthError } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import {
  loginSchema,
  magicLinkSchema,
  type LoginInput,
} from "@veloxlane/schemas";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { getAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { Field } from "@/components/auth/field";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(() => {
    const reason = searchParams.get("reason");
    if (reason === "sign-in-required") {
      return {
        tone: "error",
        message: copy.auth.errorSignInRequired,
      };
    }
    if (reason === "email-exists") {
      return {
        tone: "error",
        message: copy.auth.errorEmailExists,
      };
    }
    return null;
  });
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
    },
  });

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "sign-in-required") {
      setStatus({
        tone: "error",
        message: copy.auth.errorSignInRequired,
      });
      return;
    }
    if (reason === "email-exists") {
      setStatus({
        tone: "error",
        message: copy.auth.errorEmailExists,
      });
    }
  }, [searchParams]);

  const syncProfileFromSignupMetadata = async (
    supabase: ReturnType<typeof createClient>,
    userId: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;
    const fullName = user?.user_metadata?.full_name;
    if (
      typeof role !== "string" ||
      (role !== "buyer" && role !== "seller") ||
      typeof fullName !== "string"
    ) {
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_step, role")
      .eq("id", userId)
      .maybeSingle();

    if (
      !profile ||
      (profile.onboarding_step !== "signup" && profile.role !== "user")
    ) {
      return;
    }

    const nextStep = advanceOnboardingStep("signup", role, "signup_complete");
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        onboarding_step: nextStep,
      })
      .eq("id", userId);
  };

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    setStatus(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      const code = mapSupabaseAuthError(error.message);
      setStatus({
        tone: "error",
        message:
          code === "invalid_credentials"
            ? copy.auth.errorInvalidCredentials
            : copy.auth.errorGeneric,
      });
      setPending(false);
      return;
    }

    if (data.user) {
      await syncProfileFromSignupMetadata(supabase, data.user.id);
    }

    setStatus({ tone: "success", message: copy.auth.successLogin });
    const next = await fetch("/api/auth/next-step").then((res) => res.text());
    router.push(next || "/");
  });

  const sendMagicLink = async () => {
    const email = getValues("email");
    const parsed = magicLinkSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus({
        tone: "error",
        message: parsed.error.issues[0]?.message ?? copy.auth.errorGeneric,
      });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setStatus({
      tone: error ? "error" : "success",
      message: error ? copy.auth.errorGeneric : copy.auth.successMagicLink,
    });
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
  };

  if (pending) {
    return <AuthFormSkeleton fields={2} />;
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <Field
        autoComplete="email"
        label={copy.auth.emailLabel}
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        autoComplete="current-password"
        label={copy.auth.passwordLabel}
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      {status ? (
        <StatusMessage message={status.message} tone={status.tone} />
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? copy.auth.loading : copy.auth.submitLogin}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void sendMagicLink()}
      >
        {copy.auth.magicLinkCta}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void signInWithGoogle()}
      >
        {copy.auth.googleCta}
      </Button>
      <p className="auth-helper-text">
        <Link className="auth-inline-link" href="/forgot">
          {copy.auth.forgotPassword}
        </Link>
      </p>
    </form>
  );
}
