-- VeloxLane: platform fee payments + Stripe webhook dedup

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type text NOT NULL
    CHECK (
      type IN (
        'listing',
        'unlock',
        'featured',
        'carfax_bundle',
        'buyer_protection'
      )
    ),
  amount_cents integer NOT NULL
    CHECK (amount_cents > 0),
  stripe_payment_intent text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_payments_stripe_payment_intent
  ON public.payments (stripe_payment_intent);

CREATE INDEX idx_payments_user_id ON public.payments (user_id);
CREATE INDEX idx_payments_status ON public.payments (status);
CREATE INDEX idx_payments_type_related
  ON public.payments (type, related_id);

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.webhook_events (
  id text PRIMARY KEY,
  source text NOT NULL DEFAULT 'stripe',
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_source ON public.webhook_events (source);

-- Status updates are webhook-only (service_role); clients may insert pending rows only.
CREATE OR REPLACE FUNCTION public.protect_payment_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status
      AND COALESCE(auth.jwt()->>'role', '') <> 'service_role'
      AND NOT public.is_admin() THEN
      NEW.status := OLD.status;
    END IF;

    IF OLD.stripe_payment_intent IS DISTINCT FROM NEW.stripe_payment_intent
      AND COALESCE(auth.jwt()->>'role', '') <> 'service_role'
      AND NOT public.is_admin() THEN
      NEW.stripe_payment_intent := OLD.stripe_payment_intent;
    END IF;

    IF OLD.amount_cents IS DISTINCT FROM NEW.amount_cents
      AND COALESCE(auth.jwt()->>'role', '') <> 'service_role'
      AND NOT public.is_admin() THEN
      NEW.amount_cents := OLD.amount_cents;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_protect_fields
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_payment_fields();

CREATE TRIGGER audit_payments_status_change
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_row_change();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_select_own
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY payments_select_admin
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY payments_insert_own
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND status = 'pending'
  );

CREATE POLICY payments_update_own_metadata
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND public.is_active_user()
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_active_user()
  );

CREATE POLICY payments_update_admin
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- webhook_events: service_role only (no client policies)
