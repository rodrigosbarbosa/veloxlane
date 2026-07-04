import {
  createServiceClient,
  getCachedPayload,
  jsonResponse,
  parseVinBody,
  readVinLookup,
  upsertVinLookup,
} from "./vin.ts";

export type AutocheckPayload = {
  year: number;
  make: string;
  model: string;
  accidentCount: number;
  ownerCount: number;
  titleIssues: boolean;
  serviceRecords: number;
  /** AutoCheck Score (Experian's proprietary 1–100 vehicle score). */
  score?: number;
  cached?: boolean;
  stub?: boolean;
};

type AutocheckRequestBody = {
  vin?: string;
};

function getSecret(name: string, legacyName: string): string | undefined {
  const value = Deno.env.get(name);
  if (value) {
    return value;
  }

  const legacy = Deno.env.get(legacyName);
  if (legacy) {
    console.warn(
      `autocheck-proxy: using legacy secret ${legacyName} — set ${name} and remove the old secret`,
    );
  }

  return legacy ?? undefined;
}

function stubAutocheckData(vin: string): AutocheckPayload {
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

async function fetchAutocheckFromApi(
  vin: string,
): Promise<AutocheckPayload | null> {
  const apiBase = getSecret("AUTOCHECK_API_BASE", "CARFAX_API_BASE");
  const partnerId = getSecret("AUTOCHECK_PARTNER_ID", "CARFAX_PARTNER_ID");
  const apiKey = getSecret("AUTOCHECK_API_KEY", "CARFAX_API_KEY");

  if (!apiBase || !partnerId || !apiKey) {
    console.warn(
      "autocheck-proxy: AUTOCHECK_API_BASE / AUTOCHECK_PARTNER_ID / AUTOCHECK_API_KEY missing — returning dev stub",
    );
    return stubAutocheckData(vin);
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
    console.error("autocheck-proxy: upstream error", response.status);
    return null;
  }

  // TODO(adr-0002): this field mapping was written against the original
  // CARFAX assumption. Experian's AutoCheck partner API is not publicly
  // documented — confirm endpoint path and response field names (accidents,
  // owners, title brands, AutoCheck Score) against the real partner docs
  // before go-live.
  const payload = (await response.json()) as {
    year?: number;
    make?: string;
    model?: string;
    accidents?: number;
    owners?: number;
    titleIssues?: boolean;
    serviceRecords?: number;
    score?: number;
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
    ...(typeof payload.score === "number" ? { score: payload.score } : {}),
  };
}

export async function handleAutocheckRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  let body: AutocheckRequestBody;
  try {
    body = (await request.json()) as AutocheckRequestBody;
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
    const cached = getCachedPayload<AutocheckPayload>(row, "autocheck");

    if (cached) {
      return jsonResponse({ data: { ...cached, cached: true } });
    }
  }

  const fresh = await fetchAutocheckFromApi(vin);

  if (!fresh) {
    return jsonResponse(
      {
        message:
          "AutoCheck history is unavailable right now. You can still continue and add details manually.",
        degraded: true,
      },
      503,
    );
  }

  if (serviceClient) {
    await upsertVinLookup(serviceClient, vin, {
      autocheck_data: fresh,
      autocheck_fetched_at: new Date().toISOString(),
    });
  }

  return jsonResponse({ data: fresh });
}
