"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { copy } from "@veloxlane/brand/copy";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@veloxlane/schemas";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Field } from "@/components/auth/field";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ForgotForm() {
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setStatus({
      tone: error ? "error" : "success",
      message: error ? copy.auth.errorGeneric : copy.auth.successForgot,
    });
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <Field
        autoComplete="email"
        label={copy.auth.emailLabel}
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {status ? (
        <StatusMessage message={status.message} tone={status.tone} />
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? copy.auth.loading : copy.auth.submitForgot}
      </Button>
    </form>
  );
}
