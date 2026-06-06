import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
  corsHeaders,
  createServiceClient,
  getCachedPayload,
  jsonResponse,
  parseVinBody,
  readVinLookup,
  upsertVinLookup,
} from "../_shared/vin.ts";

type CarfaxPayload = {
  year: number;
  make: string;
  model: string;
  accidentCount: number;
  ownerCount: number;
  titleIssues: boolean;
  serviceRecords: number;
  cached?: boolean;
  stub?: boolean;
};

type CarfaxRequestBody = {
  vin?: string;
};

function stubCarfaxData(vin: string): CarfaxPayload {
  const year = 2018 + (vin.charCodeAt(9) % 6);
  return {
    year,
    make: "Honda",
    model: "Accord",
    accidentCount: vin.endsWith("2") ? 1 : 0,
    ownerCount: 2,
    titleIssues: false,
    serviceRecords: 12,
    stub: true,
  };
}

async function fetchCarfaxFromApi(vin: string): Promise<CarfaxPayload | null> {
  const apiBase = Deno.env.get("CARFAX_API_BASE");
  const partnerId = Deno.env.get("CARFAX_PARTNER_ID");
  const apiKey = Deno.env.get("CARFAX_API_KEY");

  if (!apiBase || !partnerId || !apiKey) {
    console.warn(
      "carfax-proxy: CARFAX_API_BASE / CARFAX_PARTNER_ID / CARFAX_API_KEY missing — returning dev stub",
    );
    return stubCarfaxData(vin);
  }

  const url = new URL("/vehicle/history", apiBase);
  url.searchParams.set("vin", vin);
  url.searchParams.set("partnerId", partnerId);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("carfax-proxy: upstream error", response.status);
    return null;
  }

  const payload = (await response.json()) as {
    year?: number;
    make?: string;
    model?: string;
    accidents?: number;
    owners?: number;
    titleIssues?: boolean;
    serviceRecords?: number;
  };

  if (!payload.year || !payload.make || !payload.model) {
    return null;
  }

  return {
    year: payload.year,
    make: payload.make,
    model: payload.model,
    accidentCount: payload.accidents ?? 0,
    ownerCount: payload.owners ?? 1,
    titleIssues: payload.titleIssues ?? false,
    serviceRecords: payload.serviceRecords ?? 0,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  let body: CarfaxRequestBody;
  try {
    body = (await request.json()) as CarfaxRequestBody;
  } catch {
    return jsonResponse({ message: "Invalid JSON body." }, 400);
  }

  const vinOrResponse = parseVinBody(body);
  if (vinOrResponse instanceof Response) {
    return vinOrResponse;
  }

  const vin = vinOrResponse;
  const serviceClient = createServiceClient();

  if (serviceClient) {
    const row = await readVinLookup(serviceClient, vin);
    const cached = getCachedPayload<CarfaxPayload>(row, "carfax");

    if (cached) {
      return jsonResponse({ data: { ...cached, cached: true } });
    }
  }

  const fresh = await fetchCarfaxFromApi(vin);

  if (!fresh) {
    return jsonResponse(
      {
        message:
          "CARFAX history is unavailable right now. You can still continue and add details manually.",
        degraded: true,
      },
      503,
    );
  }

  if (serviceClient) {
    await upsertVinLookup(serviceClient, vin, {
      carfax_data: fresh,
      carfax_fetched_at: new Date().toISOString(),
    });
  }

  return jsonResponse({ data: fresh });
});
