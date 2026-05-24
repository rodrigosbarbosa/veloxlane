export type ApiHealthSummary = {
  state: "configured" | "online" | "offline";
  label: string;
  detail: string;
};

type ApiHealthResponse = {
  service?: string;
  status?: string;
};

type FetchLike = typeof fetch;

export const getApiBaseUrl = (
  envValue = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL,
) => {
  const value = envValue?.trim();

  return value ? value.replace(/\/+$/, "") : null;
};

export const getApiHealthSummary = async ({
  apiBaseUrl = getApiBaseUrl(),
  fetchImpl = fetch,
  timeoutMs = 1500,
}: {
  apiBaseUrl?: string | null;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
} = {}): Promise<ApiHealthSummary> => {
  if (!apiBaseUrl) {
    return {
      state: "configured",
      label: "API ready",
      detail:
        "Add NEXT_PUBLIC_API_BASE_URL to verify live health from /health.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${apiBaseUrl}/health`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        state: "offline",
        label: "API unavailable",
        detail: `Health endpoint returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as ApiHealthResponse;

    if (payload.status === "ok") {
      return {
        state: "online",
        label: "API online",
        detail: `${payload.service ?? "veloxlane-api"} responded from /health.`,
      };
    }

    return {
      state: "offline",
      label: "API unavailable",
      detail: "Health response did not include status=ok.",
    };
  } catch {
    return {
      state: "offline",
      label: "API unavailable",
      detail: "Unable to reach the configured health endpoint.",
    };
  } finally {
    clearTimeout(timeout);
  }
};
