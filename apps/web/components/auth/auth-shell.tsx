import type { ReactNode } from "react";

import { copy } from "@veloxlane/brand/copy";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#0A1628] px-4 py-10 text-[#F8F6F1]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A7AEB9]">
            {copy.productName}
          </p>
          <div
            aria-hidden
            className="h-1 w-full rounded-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,#E8A03D 0 16px,transparent 16px 24px)",
            }}
          />
          <h1 className="text-3xl font-semibold italic tracking-tight">
            {title}
          </h1>
          <p className="text-sm leading-6 text-[#A7AEB9]">{subtitle}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
