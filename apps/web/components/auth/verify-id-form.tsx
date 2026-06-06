"use client";

import { canRetryIdentity } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { useEffect, useState } from "react";

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { StatusMessage } from "@/components/auth/status-message";
import { Button } from "@/components/ui/button";
import { loadStripeClient } from "@/lib/stripe/browser";
import { createClient } from "@/lib/supabase/client";

type IdentityProfile = {
  identityAttempts: number;
  identityManualReview: boolean;
  idVerified: boolean;
};

export function VerifyIdForm() {
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [status, setStatus] = useState<{
    tone: "error" | "success" | "info";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("identity_attempts, identity_manual_review, id_verified")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          identityAttempts: data.identity_attempts,
          identityManualReview: data.identity_manual_review,
          idVerified: data.id_verified,
        });
      }
    })();
  }, []);

  const startVerification = async () => {
    if (
      !profile ||
      !canRetryIdentity({
        attempts: profile.identityAttempts,
        manualReview: profile.identityManualReview,
        idVerified: profile.idVerified,
      })
    ) {
      setStatus({
        tone: "info",
        message: copy.auth.errorIdentityManualReview,
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/auth/identity/session", {
      method: "POST",
    });
    const payload = (await response.json()) as {
      clientSecret?: string;
      message?: string;
    };

    if (!response.ok || !payload.clientSecret) {
      setLoading(false);
      setStatus({
        tone: "error",
        message: payload.message ?? copy.auth.errorGeneric,
      });
      return;
    }

    const stripe = await loadStripeClient();

    if (!stripe) {
      setLoading(false);
      setStatus({ tone: "error", message: copy.auth.errorGeneric });
      return;
    }

    const result = await stripe.verifyIdentity(payload.clientSecret);
    setLoading(false);

    if (result.error) {
      setStatus({ tone: "error", message: copy.auth.errorGeneric });
      return;
    }

    setStatus({ tone: "success", message: copy.auth.successIdentity });
  };

  if (!profile) {
    return <AuthFormSkeleton fields={1} />;
  }

  if (profile.identityManualReview) {
    return (
      <StatusMessage tone="info" message={copy.auth.identityManualReviewNote} />
    );
  }

  if (loading) {
    return <AuthFormSkeleton fields={1} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {status ? (
        <StatusMessage message={status.message} tone={status.tone} />
      ) : null}
      <Button disabled={loading} onClick={() => void startVerification()}>
        {loading ? copy.auth.loading : copy.auth.submitIdentity}
      </Button>
    </div>
  );
}
