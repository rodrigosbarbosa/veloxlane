import { describe, expect, it, vi } from "vitest";

import { getApiBaseUrl, getApiHealthSummary } from "./api-health";

describe("getApiBaseUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(getApiBaseUrl(" https://api.veloxlane.test/// ")).toBe(
      "https://api.veloxlane.test",
    );
  });

  it("returns null for missing values", () => {
    expect(getApiBaseUrl("   ")).toBeNull();
  });
});

describe("getApiHealthSummary", () => {
  it("returns a configured state when no API base URL is present", async () => {
    await expect(getApiHealthSummary({ apiBaseUrl: null })).resolves.toEqual({
      state: "configured",
      label: "API ready",
      detail:
        "Add NEXT_PUBLIC_API_BASE_URL to verify live health from /health.",
    });
  });

  it("reports the API as online when /health returns status ok", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ service: "veloxlane-api", status: "ok" }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
    ) as typeof fetch;

    await expect(
      getApiHealthSummary({
        apiBaseUrl: "https://api.veloxlane.test",
        fetchImpl,
      }),
    ).resolves.toEqual({
      state: "online",
      label: "API online",
      detail: "veloxlane-api responded from /health.",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.veloxlane.test/health",
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("returns an offline state when fetch throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("boom");
    }) as typeof fetch;

    await expect(
      getApiHealthSummary({
        apiBaseUrl: "https://api.veloxlane.test",
        fetchImpl,
      }),
    ).resolves.toEqual({
      state: "offline",
      label: "API unavailable",
      detail: "Unable to reach the configured health endpoint.",
    });
  });
});
