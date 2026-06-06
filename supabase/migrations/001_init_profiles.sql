-- VeloxLane: profiles + auth.users mirror trigger

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'seller', 'buyer', 'admin', 'staff')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned')),
  id_verified boolean NOT NULL DEFAULT false,
  risk_score integer NOT NULL DEFAULT 0
    CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_status ON public.profiles (status);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Mirror auth.users into public.profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
