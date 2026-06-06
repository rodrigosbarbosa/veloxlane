-- VeloxLane: auth onboarding fields + phone OTP rate limiting

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step text NOT NULL DEFAULT 'signup'
    CHECK (
      onboarding_step IN ('signup', 'phone', 'identity', 'complete')
    ),
  ADD COLUMN IF NOT EXISTS identity_attempts integer NOT NULL DEFAULT 0
    CHECK (identity_attempts >= 0),
  ADD COLUMN IF NOT EXISTS identity_manual_review boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified
  ON public.profiles (phone)
  WHERE phone_verified = true;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step
  ON public.profiles (onboarding_step);

CREATE TABLE public.auth_phone_rate_limits (
  phone text PRIMARY KEY,
  verify_attempts integer NOT NULL DEFAULT 0,
  resend_attempts integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  cooldown_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER auth_phone_rate_limits_set_updated_at
  BEFORE UPDATE ON public.auth_phone_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.auth_phone_rate_limits ENABLE ROW LEVEL SECURITY;

-- Server-only table: no client policies (service_role / edge functions only)
