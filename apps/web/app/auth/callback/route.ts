import { NextResponse } from "next/server";

import { getPostAuthPath } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectPath = next ?? (await getPostAuthPath());
  return NextResponse.redirect(`${origin}${redirectPath}`);
}
