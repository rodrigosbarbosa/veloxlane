import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyIdForm } from "@/components/auth/verify-id-form";
import { copy } from "@veloxlane/brand/copy";

export default function VerifyIdPage() {
  return (
    <AuthShell
      subtitle={copy.auth.verifyIdSubtitle}
      title={copy.auth.verifyIdTitle}
    >
      <VerifyIdForm />
    </AuthShell>
  );
}
