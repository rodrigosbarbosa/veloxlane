import {
  getPostAuthRedirect,
  type ProfileOnboardingState,
} from "@veloxlane/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { supabase } from "~/lib/supabase";

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/(onboarding)/sign-up");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "role, phone_verified, id_verified, onboarding_step, identity_manual_review",
        )
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        router.replace("/(onboarding)/sign-up");
        setLoading(false);
        return;
      }

      const path = getPostAuthRedirect(
        {
          onboardingStep:
            profile.onboarding_step as ProfileOnboardingState["onboardingStep"],
          role: profile.role as ProfileOnboardingState["role"],
          phoneVerified: profile.phone_verified,
          idVerified: profile.id_verified,
          identityManualReview: profile.identity_manual_review,
        },
        "mobile",
      );

      router.replace(path);
      setLoading(false);
    })();
  }, [router]);

  return { loading };
}
