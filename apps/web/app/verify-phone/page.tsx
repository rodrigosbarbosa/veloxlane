import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyPhoneForm } from "@/components/auth/verify-phone-form";
import { copy } from "@veloxlane/brand/copy";

export default function VerifyPhonePage() {
  return (
    <AuthShell
      subtitle={copy.auth.verifyPhoneSubtitle}
      title={copy.auth.verifyPhoneTitle}
    >
      <VerifyPhoneForm />
    </AuthShell>
  );
}
