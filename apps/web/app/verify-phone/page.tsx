import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyPhoneForm } from "@/components/auth/verify-phone-form";
import { createClient } from "@/lib/supabase/server";
import { copy } from "@veloxlane/brand/copy";

export default async function VerifyPhonePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?reason=sign-in-required");
  }

  return (
    <AuthShell
      subtitle={copy.auth.verifyPhoneSubtitle}
      title={copy.auth.verifyPhoneTitle}
    >
      <VerifyPhoneForm />
    </AuthShell>
  );
}
