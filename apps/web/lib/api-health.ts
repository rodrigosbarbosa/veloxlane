export type EdgeHealthSummary = {
  state: "configured" | "online" | "offline";
  label: string;
  detail: string;
};

type FetchLike = typeof fetch;

export const getSupabaseFunctionsUrl = (
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) => {
  const value = supabaseUrl?.trim();

  return value ? `${value.replace(/\/+$/, "")}/functions/v1` : null;
};

export const getEdgeHealthSummary = async ({
  functionsBaseUrl = getSupabaseFunctionsUrl(),
  fetchImpl = fetch,
  timeoutMs = 1500,
}: {
  functionsBaseUrl?: string | null;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
} = {}): Promise<EdgeHealthSummary> => {
  if (!functionsBaseUrl) {
    return {
      state: "configured",
      label: "Edge functions ready",
      detail:
        "Add NEXT_PUBLIC_SUPABASE_URL to verify the Supabase health function.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${functionsBaseUrl}/health`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        state: "offline",
        label: "Edge function unavailable",
        detail: `Health function returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as { status?: string };

    if (payload.status === "ok") {
      return {
        state: "online",
        label: "Edge function online",
        detail: "Supabase health function responded with status=ok.",
      };
    }

    return {
      state: "offline",
      label: "Edge function unavailable",
      detail: "Health response did not include status=ok.",
    };
  } catch {
    return {
      state: "offline",
      label: "Edge function unavailable",
      detail: "Unable to reach the Supabase health function.",
    };
  } finally {
    clearTimeout(timeout);
  }
};

/** @deprecated Use getEdgeHealthSummary — VeloxLane uses Supabase Edge Functions, not apps/api. */
export const getApiHealthSummary = getEdgeHealthSummary;

/** @deprecated Use getSupabaseFunctionsUrl */
export const getApiBaseUrl = getSupabaseFunctionsUrl;
