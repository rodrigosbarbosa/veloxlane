import {
  getPostAuthRedirect,
  type ProfileOnboardingState,
} from "@veloxlane/auth";

import { createClient } from "@/lib/supabase/server";

export type ProfileRecord = ProfileOnboardingState & {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export async function getCurrentProfile(): Promise<ProfileRecord | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, role, phone_verified, id_verified, onboarding_step, identity_manual_review",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    role: data.role as ProfileOnboardingState["role"],
    phoneVerified: data.phone_verified,
    idVerified: data.id_verified,
    onboardingStep:
      data.onboarding_step as ProfileOnboardingState["onboardingStep"],
    identityManualReview: data.identity_manual_review,
  };
}

export async function getPostAuthPath(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return "/login";
  }

  return getPostAuthRedirect(profile, "web");
}
