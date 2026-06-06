import { describe, expect, it, vi } from "vitest";

import { getEdgeHealthSummary, getSupabaseFunctionsUrl } from "./api-health";

describe("getSupabaseFunctionsUrl", () => {
  it("builds the functions base URL from the Supabase project URL", () => {
    expect(getSupabaseFunctionsUrl("https://abc.supabase.co/")).toBe(
      "https://abc.supabase.co/functions/v1",
    );
  });

  it("returns null for missing values", () => {
    expect(getSupabaseFunctionsUrl("   ")).toBeNull();
  });
});

describe("getEdgeHealthSummary", () => {
  it("returns configured when no Supabase URL is present", async () => {
    await expect(
      getEdgeHealthSummary({ functionsBaseUrl: null }),
    ).resolves.toEqual({
      state: "configured",
      label: "Edge functions ready",
      detail:
        "Add NEXT_PUBLIC_SUPABASE_URL to verify the Supabase health function.",
    });
  });

  it("reports online when the health function returns status ok", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    ) as typeof fetch;

    await expect(
      getEdgeHealthSummary({
        functionsBaseUrl: "https://abc.supabase.co/functions/v1",
        fetchImpl,
      }),
    ).resolves.toMatchObject({
      state: "online",
      label: "Edge function online",
    });
  });
});
