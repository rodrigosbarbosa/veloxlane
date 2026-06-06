import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { copy } from "@veloxlane/brand/copy";

export default function SignupPage() {
  return (
    <AuthShell
      subtitle={copy.auth.signupSubtitle}
      title={copy.auth.signupTitle}
    >
      <SignupForm />
    </AuthShell>
  );
}
