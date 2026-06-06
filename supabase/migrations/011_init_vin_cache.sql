-- VeloxLane: VIN lookup cache (CARFAX + Marketcheck)
-- Note: spec referenced 009_init_vin_cache.sql; 009 is auth_onboarding, 010 is payments.

CREATE TABLE public.vin_lookups (
  vin text PRIMARY KEY
    CHECK (char_length(vin) = 17),
  carfax_data jsonb,
  carfax_fetched_at timestamptz,
  marketcheck_data jsonb,
  marketcheck_fetched_at timestamptz,
  nhtsa_recalls jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vin_lookups_carfax_fetched_at
  ON public.vin_lookups (carfax_fetched_at);

CREATE INDEX idx_vin_lookups_marketcheck_fetched_at
  ON public.vin_lookups (marketcheck_fetched_at);

CREATE TRIGGER vin_lookups_set_updated_at
  BEFORE UPDATE ON public.vin_lookups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vin_lookups ENABLE ROW LEVEL SECURITY;

-- vin_lookups is server-managed cache only. Edge functions use service_role.
-- No authenticated/anon policies — clients never read or write this table directly.

COMMENT ON TABLE public.vin_lookups IS
  'Server-side VIN lookup cache. CARFAX (90d TTL) and Marketcheck (30d TTL). NHTSA is live-only.';
