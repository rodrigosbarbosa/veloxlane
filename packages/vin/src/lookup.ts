import type {
  CarfaxData,
  MarketcheckData,
  NhtsaData,
  VinLookupPreview,
} from "./types";

type LookupSourceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type VinLookupSources = {
  carfax: LookupSourceResult<CarfaxData>;
  marketcheck: LookupSourceResult<MarketcheckData>;
  nhtsa: LookupSourceResult<NhtsaData>;
};

function pickVehicleIdentity(
  carfax: CarfaxData | null,
  marketcheck: MarketcheckData | null,
  nhtsa: NhtsaData | null,
): Pick<VinLookupPreview, "year" | "make" | "model"> {
  const year = carfax?.year ?? marketcheck?.year ?? nhtsa?.year;
  const make = carfax?.make ?? marketcheck?.make ?? nhtsa?.make;
  const model = carfax?.model ?? marketcheck?.model ?? nhtsa?.model;

  return { year, make, model };
}

export function mergeVinLookupPreview(
  vin: string,
  sources: VinLookupSources,
): VinLookupPreview {
  const carfax = sources.carfax.ok ? sources.carfax.data : null;
  const marketcheck = sources.marketcheck.ok ? sources.marketcheck.data : null;
  const nhtsa = sources.nhtsa.ok ? sources.nhtsa.data : null;

  const errors: VinLookupPreview["errors"] = {};

  if (!sources.carfax.ok) {
    errors.carfax = sources.carfax.error;
  }

  if (!sources.marketcheck.ok) {
    errors.marketcheck = sources.marketcheck.error;
  }

  if (!sources.nhtsa.ok) {
    errors.nhtsa = sources.nhtsa.error;
  }

  const identity = pickVehicleIdentity(carfax, marketcheck, nhtsa);

  return {
    vin,
    ...identity,
    carfax,
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
