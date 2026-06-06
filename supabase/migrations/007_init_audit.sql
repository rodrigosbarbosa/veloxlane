-- VeloxLane: audit_log + triggers on critical tables

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor_id ON public.audit_log (actor_id);
CREATE INDEX idx_audit_log_resource ON public.audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);

CREATE TRIGGER audit_log_set_updated_at
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_resource_id uuid;
  v_metadata jsonb;
BEGIN
  v_actor_id := auth.uid();

  IF TG_OP = 'DELETE' THEN
    v_resource_id := OLD.id;
    v_metadata := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_resource_id := NEW.id;
    v_metadata := jsonb_build_object('new', to_jsonb(NEW));
  ELSE
    v_resource_id := NEW.id;
    v_metadata := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  END IF;

  INSERT INTO public.audit_log (
    actor_id,
    action,
    resource_type,
    resource_id,
    metadata
  )
  VALUES (
    v_actor_id,
    TG_OP,
    TG_TABLE_NAME,
    v_resource_id,
    v_metadata
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_listings_status_change
  AFTER UPDATE OF status ON public.listings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER audit_offers_status_change
  AFTER UPDATE OF status ON public.offers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER audit_escrow_status_change
  AFTER UPDATE OF status ON public.escrow_transactions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER audit_profiles_status_change
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_row_change();

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
