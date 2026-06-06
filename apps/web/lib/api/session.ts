import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@veloxlane/db";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export async function requireApiSession(
  supabase: SupabaseClient<Database>,
  request?: Request,
): Promise<
  { userId: string; accessToken: string } | { response: NextResponse }
> {
  const bearerToken = request ? getBearerToken(request) : null;

  if (bearerToken) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearerToken);

    if (error || !user) {
      return {
        response: NextResponse.json(
          { message: "Sign in required." },
          { status: 401 },
        ),
      };
    }

    return {
      userId: user.id,
      accessToken: bearerToken,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      response: NextResponse.json(
        { message: "Sign in required." },
        { status: 401 },
      ),
    };
  }

  return {
    userId: session.user.id,
    accessToken: session.access_token,
  };
}
