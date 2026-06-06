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

type MarketcheckPayload = {
  year: number;
  make: string;
  model: string;
  fairPriceLow: number;
  fairPriceHigh: number;
  fairPriceMid: number;
  cached?: boolean;
  stub?: boolean;
};

type MarketcheckRequestBody = {
  vin?: string;
};

function stubMarketcheckData(vin: string): MarketcheckPayload {
  const year = 2018 + (vin.charCodeAt(10) % 6);
  const mid = 18000 + (vin.charCodeAt(11) % 8) * 500;
  return {
    year,
    make: "Honda",
    model: "Accord",
    fairPriceLow: mid - 2500,
    fairPriceHigh: mid + 2500,
    fairPriceMid: mid,
    stub: true,
  };
}

async function fetchMarketcheckFromApi(
  vin: string,
): Promise<MarketcheckPayload | null> {
  const apiBase =
    Deno.env.get("MARKETCHECK_API_BASE") ?? "https://mc-api.marketcheck.com/v2";
  const apiKey = Deno.env.get("MARKETCHECK_API_KEY");

  if (!apiKey) {
    console.warn(
      "marketcheck-proxy: MARKETCHECK_API_KEY missing — returning dev stub",
    );
    return stubMarketcheckData(vin);
  }

  const url = new URL("/predict/car/us/marketcheck_price", apiBase);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("vin", vin);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    console.error("marketcheck-proxy: upstream error", response.status);
    return null;
  }

  const payload = (await response.json()) as {
    year?: number;
    make?: string;
    model?: string;
    price?: number;
    price_range_low?: number;
    price_range_high?: number;
  };

  const mid = payload.price;
  const low = payload.price_range_low ?? (mid ? mid - 2500 : undefined);
  const high = payload.price_range_high ?? (mid ? mid + 2500 : undefined);

  if (
    !payload.year ||
    !payload.make ||
    !payload.model ||
    !mid ||
    !low ||
    !high
  ) {
    return null;
  }

  return {
    year: payload.year,
    make: payload.make,
    model: payload.model,
    fairPriceMid: mid,
    fairPriceLow: low,
    fairPriceHigh: high,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  let body: MarketcheckRequestBody;
  try {
    body = (await request.json()) as MarketcheckRequestBody;
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
    const cached = getCachedPayload<MarketcheckPayload>(row, "marketcheck");

    if (cached) {
      return jsonResponse({ data: { ...cached, cached: true } });
    }
  }

  const fresh = await fetchMarketcheckFromApi(vin);

  if (!fresh) {
    return jsonResponse(
      {
        message:
          "Fair-market pricing is unavailable right now. You can still set your price manually.",
        degraded: true,
      },
      503,
    );
  }

  if (serviceClient) {
    await upsertVinLookup(serviceClient, vin, {
      marketcheck_data: fresh,
      marketcheck_fetched_at: new Date().toISOString(),
    });
  }

  return jsonResponse({ data: fresh });
});
