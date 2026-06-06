-- VeloxLane: affiliate_clicks

CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  offer_type text NOT NULL
    CHECK (
      offer_type IN (
        'warranty',
        'insurance',
        'financing',
        'inspection',
        'transport'
      )
    ),
  partner text NOT NULL,
  commission_estimate numeric(12, 2)
    CHECK (commission_estimate IS NULL OR commission_estimate >= 0),
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_clicks_user_id ON public.affiliate_clicks (user_id);
CREATE INDEX idx_affiliate_clicks_offer_type ON public.affiliate_clicks (offer_type);
CREATE INDEX idx_affiliate_clicks_partner ON public.affiliate_clicks (partner);

CREATE TRIGGER affiliate_clicks_set_updated_at
  BEFORE UPDATE ON public.affiliate_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
