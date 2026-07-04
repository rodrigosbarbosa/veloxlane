import type {
  AutocheckData,
  MarketcheckData,
  NhtsaData,
  VinLookupPreview,
} from "./types";

type LookupSourceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type VinLookupSources = {
  autocheck: LookupSourceResult<AutocheckData>;
  marketcheck: LookupSourceResult<MarketcheckData>;
  nhtsa: LookupSourceResult<NhtsaData>;
};

function pickVehicleIdentity(
  autocheck: AutocheckData | null,
  marketcheck: MarketcheckData | null,
  nhtsa: NhtsaData | null,
): Pick<VinLookupPreview, "year" | "make" | "model"> {
  const year = autocheck?.year ?? marketcheck?.year ?? nhtsa?.year;
  const make = autocheck?.make ?? marketcheck?.make ?? nhtsa?.make;
  const model = autocheck?.model ?? marketcheck?.model ?? nhtsa?.model;

  return { year, make, model };
}

export function mergeVinLookupPreview(
  vin: string,
  sources: VinLookupSources,
): VinLookupPreview {
  const autocheck = sources.autocheck.ok ? sources.autocheck.data : null;
  const marketcheck = sources.marketcheck.ok ? sources.marketcheck.data : null;
  const nhtsa = sources.nhtsa.ok ? sources.nhtsa.data : null;

  const errors: VinLookupPreview["errors"] = {};

  if (!sources.autocheck.ok) {
    errors.autocheck = sources.autocheck.error;
  }

  if (!sources.marketcheck.ok) {
    errors.marketcheck = sources.marketcheck.error;
  }

  if (!sources.nhtsa.ok) {
    errors.nhtsa = sources.nhtsa.error;
  }

  const identity = pickVehicleIdentity(autocheck, marketcheck, nhtsa);

  return {
    vin,
    ...identity,
    autocheck,
    marketcheck,
    nhtsa,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

export type PriceRangePosition = "below" | "fair" | "above" | "unknown";

export function getPriceRangePosition(
  price: number | null | undefined,
  low: number | null | undefined,
  high: number | null | undefined,
): PriceRangePosition {
  if (
    price === null ||
    price === undefined ||
    low === null ||
    low === undefined ||
    high === null ||
    high === undefined ||
    low > high
  ) {
    return "unknown";
  }

  if (price < low) {
    return "below";
  }

  if (price > high) {
    return "above";
  }

  return "fair";
}
