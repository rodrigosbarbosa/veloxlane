import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";
import { copy } from "@veloxlane/brand/copy";

export default function ForgotPage() {
  return (
    <AuthShell
      subtitle={copy.auth.forgotSubtitle}
      title={copy.auth.forgotTitle}
    >
      <ForgotForm />
    </AuthShell>
  );
}
