import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { copy } from "@veloxlane/brand/copy";

export default function LoginPage() {
  return (
    <AuthShell subtitle={copy.auth.loginSubtitle} title={copy.auth.loginTitle}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
