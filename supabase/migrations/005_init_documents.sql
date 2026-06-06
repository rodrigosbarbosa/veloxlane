-- VeloxLane: bill_of_sale, inspections

CREATE TABLE public.bill_of_sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES public.offers (id) ON DELETE SET NULL,
  state text NOT NULL
    CHECK (state IN ('FL', 'TX')),
  pdf_url text,
  seller_signed_at timestamptz,
  buyer_signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bill_of_sale_offer_id ON public.bill_of_sale (offer_id);

CREATE TRIGGER bill_of_sale_set_updated_at
  BEFORE UPDATE ON public.bill_of_sale
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  provider text NOT NULL,
  booked_at timestamptz,
  report_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN ('pending', 'booked', 'completed', 'cancelled')
    ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inspections_listing_id ON public.inspections (listing_id);
CREATE INDEX idx_inspections_status ON public.inspections (status);

CREATE TRIGGER inspections_set_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bill_of_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
