import type { SupabaseClient } from "@supabase/supabase-js";

import { mergeVinLookupPreview, type VinLookupSources } from "./lookup";
import type {
  CarfaxData,
  MarketcheckData,
  NhtsaData,
  VinLookupPreview,
} from "./types";

type FunctionEnvelope<T> = {
  data?: T;
  message?: string;
  degraded?: boolean;
};

async function invokeSource<T>(
  client: SupabaseClient,
  functionName: string,
  vin: string,
  fallbackMessage: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const { data, error } = await client.functions.invoke(functionName, {
    body: { vin },
  });

  if (error) {
    return { ok: false, error: error.message || fallbackMessage };
  }

  const envelope = data as FunctionEnvelope<T> | T | null;

  if (envelope && typeof envelope === "object" && "data" in envelope) {
    const wrapped = envelope as FunctionEnvelope<T>;
    if (wrapped.data) {
      return { ok: true, data: wrapped.data };
    }

    return {
      ok: false,
      error: wrapped.message ?? fallbackMessage,
    };
  }

  if (envelope && typeof envelope === "object") {
    return { ok: true, data: envelope as T };
  }

  return { ok: false, error: fallbackMessage };
}

export async function fetchVinLookupPreview(
  client: SupabaseClient,
  vin: string,
): Promise<VinLookupPreview> {
  const [carfaxResult, marketcheckResult, nhtsaResult] = await Promise.all([
    invokeSource<CarfaxData>(
      client,
      "carfax-proxy",
      vin,
      "AutoCheck history is unavailable right now.",
    ),
    invokeSource<MarketcheckData>(
      client,
      "marketcheck-proxy",
      vin,
      "Fair-market pricing is unavailable right now.",
    ),
    invokeSource<NhtsaData>(
      client,
      "nhtsa-recalls",
      vin,
      "Recall data is unavailable right now.",
    ),
  ]);

  const sources: VinLookupSources = {
    carfax: carfaxResult,
    marketcheck: marketcheckResult,
    nhtsa: nhtsaResult,
  };

  return mergeVinLookupPreview(vin, sources);
}
