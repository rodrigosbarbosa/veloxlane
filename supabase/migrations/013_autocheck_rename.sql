-- VeloxLane: rename vehicle-history storage from CARFAX to AutoCheck naming.
-- See docs/decisions/0002-autocheck-vehicle-history.md.
--
-- Additive-only: new autocheck_* columns are added and backfilled; the legacy
-- carfax_* columns stay until the old carfax-proxy Edge Function is undeployed,
-- then get dropped in a follow-up migration. New code reads/writes only the
-- autocheck_* columns.

-- listings ------------------------------------------------------------------

ALTER TABLE public.listings
  ADD COLUMN autocheck_data jsonb;

UPDATE public.listings
SET autocheck_data = carfax_data
WHERE carfax_data IS NOT NULL
  AND autocheck_data IS NULL;

COMMENT ON COLUMN public.listings.autocheck_data IS
  'AutoCheck vehicle-history snapshot attached to the listing.';
COMMENT ON COLUMN public.listings.carfax_data IS
  'DEPRECATED — superseded by autocheck_data. Drop after the legacy carfax-proxy Edge Function is undeployed.';

-- vin_lookups ---------------------------------------------------------------

ALTER TABLE public.vin_lookups
  ADD COLUMN autocheck_data jsonb,
  ADD COLUMN autocheck_fetched_at timestamptz;

UPDATE public.vin_lookups
SET autocheck_data = carfax_data,
    autocheck_fetched_at = carfax_fetched_at
WHERE carfax_data IS NOT NULL
  AND autocheck_data IS NULL;

CREATE INDEX idx_vin_lookups_autocheck_fetched_at
  ON public.vin_lookups (autocheck_fetched_at);

COMMENT ON COLUMN public.vin_lookups.carfax_data IS
  'DEPRECATED — superseded by autocheck_data. Drop after the legacy carfax-proxy Edge Function is undeployed.';
COMMENT ON COLUMN public.vin_lookups.carfax_fetched_at IS
  'DEPRECATED — superseded by autocheck_fetched_at. Drop after the legacy carfax-proxy Edge Function is undeployed.';

COMMENT ON TABLE public.vin_lookups IS
  'Server-side VIN lookup cache. AutoCheck (90d TTL) and Marketcheck (30d TTL). NHTSA is live-only.';
