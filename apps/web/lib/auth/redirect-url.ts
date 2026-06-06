/**
 * Canonical post-auth redirect for Supabase email links and OAuth.
 * Prefer NEXT_PUBLIC_APP_URL so staging/prod emails use the deployed origin,
 * not whatever Site URL is configured in the Supabase dashboard.
 */
export function getAuthCallbackUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/auth/callback`;
}
