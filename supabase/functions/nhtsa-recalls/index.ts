import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { corsHeaders, jsonResponse, parseVinBody } from "../_shared/vin.ts";

type NhtsaRecall = {
  campaignNumber?: string;
  component?: string;
  summary?: string;
  consequence?: string;
  remedy?: string;
};

type NhtsaPayload = {
  year?: number;
  make?: string;
  model?: string;
  recallCount: number;
  recalls: NhtsaRecall[];
  stub?: boolean;
};

type NhtsaRequestBody = {
  vin?: string;
};

const NHTSA_API_BASE =
  Deno.env.get("NHTSA_API_BASE") ?? "https://vpic.nhtsa.dot.gov/api";

function stubNhtsaData(vin: string): NhtsaPayload {
  return {
    year: 2018 + (vin.charCodeAt(12) % 6),
    make: "HONDA",
    model: "Accord",
    recallCount: vin.endsWith("2") ? 1 : 0,
    recalls: vin.endsWith("2")
      ? [
          {
            campaignNumber: "23V-000",
            component: "AIR BAGS",
            summary: "Dev stub recall for local testing.",
          },
        ]
      : [],
    stub: true,
  };
}

async function decodeVin(
  vin: string,
): Promise<Pick<NhtsaPayload, "year" | "make" | "model">> {
  const url = `${NHTSA_API_BASE}/vehicles/DecodeVinValues/${vin}?format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    return {};
  }

  const payload = (await response.json()) as {
    Results?: Array<{
      ModelYear?: string;
      Make?: string;
      Model?: string;
    }>;
  };

  const result = payload.Results?.[0];
  const year = result?.ModelYear
    ? Number.parseInt(result.ModelYear, 10)
    : undefined;

  return {
    year: Number.isNaN(year) ? undefined : year,
    make: result?.Make || undefined,
    model: result?.Model || undefined,
  };
}

async function fetchRecalls(
  vin: string,
  identity: Pick<NhtsaPayload, "year" | "make" | "model">,
): Promise<NhtsaRecall[]> {
  const recallsUrl = `https://api.nhtsa.gov/recalls/recallsByVin/${vin}`;
  const response = await fetch(recallsUrl);

  if (response.ok) {
    const payload = (await response.json()) as {
      results?: Array<{
        NHTSACampaignNumber?: string;
        Component?: string;
        Summary?: string;
        Consequence?: string;
        Remedy?: string;
      }>;
    };

    return (payload.results ?? []).map((item) => ({
      campaignNumber: item.NHTSACampaignNumber,
      component: item.Component,
      summary: item.Summary,
      consequence: item.Consequence,
      remedy: item.Remedy,
    }));
  }

  if (!identity.make || !identity.model || !identity.year) {
    return [];
  }

  const fallbackUrl = new URL("https://api.nhtsa.gov/recalls/recallsByVehicle");
  fallbackUrl.searchParams.set("make", identity.make);
  fallbackUrl.searchParams.set("model", identity.model);
  fallbackUrl.searchParams.set("modelYear", String(identity.year));

  const fallbackResponse = await fetch(fallbackUrl.toString());
  if (!fallbackResponse.ok) {
    return [];
  }

  const fallbackPayload = (await fallbackResponse.json()) as {
    results?: Array<{
      NHTSACampaignNumber?: string;
      Component?: string;
      Summary?: string;
      Consequence?: string;
      Remedy?: string;
    }>;
  };

  return (fallbackPayload.results ?? []).map((item) => ({
    campaignNumber: item.NHTSACampaignNumber,
    component: item.Component,
    summary: item.Summary,
    consequence: item.Consequence,
    remedy: item.Remedy,
  }));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  let body: NhtsaRequestBody;
  try {
    body = (await request.json()) as NhtsaRequestBody;
  } catch {
    return jsonResponse({ message: "Invalid JSON body." }, 400);
  }

  const vinOrResponse = parseVinBody(body);
  if (vinOrResponse instanceof Response) {
    return vinOrResponse;
  }

  const vin = vinOrResponse;

  try {
    const identity = await decodeVin(vin);
    const recalls = await fetchRecalls(vin, identity);

    return jsonResponse({
      data: {
        ...identity,
        recallCount: recalls.length,
        recalls,
      } satisfies NhtsaPayload,
    });
  } catch (error) {
    console.error(
      "nhtsa-recalls: live fetch failed",
      error instanceof Error ? error.message : "unknown",
    );

    if (Deno.env.get("APP_ENV") === "production") {
      return jsonResponse(
        {
          message:
            "Recall data is unavailable right now. You can still continue your listing.",
          degraded: true,
        },
        503,
      );
    }

    console.warn("nhtsa-recalls: returning dev stub after fetch failure");
    return jsonResponse({ data: stubNhtsaData(vin) });
  }
});
