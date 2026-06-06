/** CARFAX is paid per call — cache aggressively. */
export const CARFAX_CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Marketcheck pricing — refresh monthly. */
export const MARKETCHECK_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type CacheSource = "carfax" | "marketcheck";

const TTL_BY_SOURCE: Record<CacheSource, number> = {
  carfax: CARFAX_CACHE_TTL_MS,
  marketcheck: MARKETCHECK_CACHE_TTL_MS,
};

export function getCacheTtlMs(source: CacheSource): number {
  return TTL_BY_SOURCE[source];
}

export function isCacheFresh(
  fetchedAt: string | Date | null | undefined,
  source: CacheSource,
  now: Date = new Date(),
): boolean {
  if (!fetchedAt) {
    return false;
  }

  const fetchedMs =
    fetchedAt instanceof Date ? fetchedAt.getTime() : Date.parse(fetchedAt);

  if (Number.isNaN(fetchedMs)) {
    return false;
  }

  const ageMs = now.getTime() - fetchedMs;
  return ageMs >= 0 && ageMs < getCacheTtlMs(source);
}
