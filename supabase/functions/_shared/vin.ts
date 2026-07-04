import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VIN_LENGTH = 17;
const VIN_CHARSET_REGEX = /^[A-HJ-NPR-Z0-9]+$/;

const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};

const VIN_WEIGHTS = [
  8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2,
] as const;
const AUTOCHECK_CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MARKETCHECK_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type CacheSource = "autocheck" | "marketcheck";

export type VinLookupRow = {
  vin: string;
  autocheck_data: Record<string, unknown> | null;
  autocheck_fetched_at: string | null;
  marketcheck_data: Record<string, unknown> | null;
  marketcheck_fetched_at: string | null;
  nhtsa_recalls: Record<string, unknown> | null;
};

function normalizeVinInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, VIN_LENGTH);
}

function vinCharValue(char: string): number | null {
  if (/[0-9]/.test(char)) {
    return Number.parseInt(char, 10);
  }

  return VIN_TRANSLITERATION[char] ?? null;
}

function computeVinCheckDigit(vin: string): string {
  const normalized = normalizeVinInput(vin);
  if (normalized.length !== VIN_LENGTH) {
    return "";
  }

  let sum = 0;
  for (let index = 0; index < VIN_LENGTH; index += 1) {
    const value = vinCharValue(normalized[index] ?? "");
    if (value === null) {
      return "";
    }
    sum += value * (VIN_WEIGHTS[index] ?? 0);
  }

  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

function isVinCheckDigitValid(vin: string): boolean {
  const normalized = normalizeVinInput(vin);
  if (normalized.length !== VIN_LENGTH || !VIN_CHARSET_REGEX.test(normalized)) {
    return false;
  }

  return normalized[8] === computeVinCheckDigit(normalized);
}

function isCacheFresh(
  fetchedAt: string | null | undefined,
  source: CacheSource,
  now = new Date(),
): boolean {
  if (!fetchedAt) {
    return false;
  }

  const fetchedMs = Date.parse(fetchedAt);
  if (Number.isNaN(fetchedMs)) {
    return false;
  }

  const ttl =
    source === "autocheck" ? AUTOCHECK_CACHE_TTL_MS : MARKETCHECK_CACHE_TTL_MS;
  const ageMs = now.getTime() - fetchedMs;
  return ageMs >= 0 && ageMs < ttl;
}

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

export function parseVinBody(body: { vin?: string }): string | Response {
  const raw = (body.vin ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (raw.length === 0) {
    return jsonResponse(
      { message: "Enter your 17-character VIN.", code: "empty" },
      400,
    );
  }

  if (/[IOQ]/.test(raw)) {
    return jsonResponse(
      {
        message: "VIN cannot include the letters I, O, or Q.",
        code: "invalid_characters",
      },
      400,
    );
  }

  const normalized = normalizeVinInput(body.vin ?? "");

  if (normalized.length !== VIN_LENGTH) {
    return jsonResponse(
      {
        message: `VIN must be ${VIN_LENGTH} characters (${normalized.length} so far).`,
        code: "invalid_length",
      },
      400,
    );
  }

  if (!VIN_CHARSET_REGEX.test(normalized)) {
    return jsonResponse(
      {
        message: "VIN cannot include the letters I, O, or Q.",
        code: "invalid_characters",
      },
      400,
    );
  }

  if (!isVinCheckDigitValid(normalized)) {
    return jsonResponse(
      {
        message:
          "That VIN does not pass the check-digit test. Double-check and try again.",
        code: "invalid_check_digit",
      },
      400,
    );
  }

  return normalized;
}

export function createServiceClient(): SupabaseClient | null {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function readVinLookup(
  client: SupabaseClient,
  vin: string,
): Promise<VinLookupRow | null> {
  const { data, error } = await client
    .from("vin_lookups")
    .select(
      "vin, autocheck_data, autocheck_fetched_at, marketcheck_data, marketcheck_fetched_at, nhtsa_recalls",
    )
    .eq("vin", vin)
    .maybeSingle();

  if (error) {
    console.error("vin_lookups read failed", error.message);
    return null;
  }

  return data as VinLookupRow | null;
}

export async function upsertVinLookup(
  client: SupabaseClient,
  vin: string,
  patch: Partial<
    Pick<
      VinLookupRow,
      | "autocheck_data"
      | "autocheck_fetched_at"
      | "marketcheck_data"
      | "marketcheck_fetched_at"
      | "nhtsa_recalls"
    >
  >,
): Promise<void> {
  const { error } = await client.from("vin_lookups").upsert(
    {
      vin,
      ...patch,
    },
    { onConflict: "vin" },
  );

  if (error) {
    console.error("vin_lookups upsert failed", error.message);
  }
}

export function getCachedPayload<T extends Record<string, unknown>>(
  row: VinLookupRow | null,
  source: CacheSource,
): T | null {
  if (!row) {
    return null;
  }

  if (source === "autocheck") {
    if (!isCacheFresh(row.autocheck_fetched_at, "autocheck")) {
      return null;
    }

    return row.autocheck_data as T | null;
  }

  if (!isCacheFresh(row.marketcheck_fetched_at, "marketcheck")) {
    return null;
  }

  return row.marketcheck_data as T | null;
}
