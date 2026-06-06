-- VeloxLane: listings, photos, full-text search

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  vin text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL
    CHECK (year >= 1900 AND year <= 2100),
  mileage integer NOT NULL DEFAULT 0
    CHECK (mileage >= 0),
  price numeric(12, 2) NOT NULL
    CHECK (price >= 0),
  description text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'pending', 'sold', 'removed')),
  carfax_data jsonb,
  escrow_fee_mode text
    CHECK (escrow_fee_mode IS NULL OR escrow_fee_mode IN ('buyer', 'seller', 'split')),
  location text NOT NULL,
  state text NOT NULL
    CHECK (state IN ('FL', 'TX')),
  photos_count integer NOT NULL DEFAULT 0
    CHECK (photos_count >= 0),
  published_at timestamptz,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      coalesce(make, '') || ' ' || coalesce(model, '') || ' ' || coalesce(description, '')
    )
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_status_location ON public.listings (status, location);
CREATE INDEX idx_listings_make_model_year ON public.listings (make, model, year);
CREATE INDEX idx_listings_seller_id ON public.listings (seller_id);
CREATE INDEX idx_listings_state ON public.listings (state);
CREATE INDEX idx_listings_search ON public.listings USING gin (search_vector);

CREATE TRIGGER listings_set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  storage_path text,
  processed_path text,
  plate_detected boolean NOT NULL DEFAULT false,
  plate_bbox jsonb,
  plate_cover_status text NOT NULL DEFAULT 'pending'
    CHECK (
      plate_cover_status IN (
        'pending',
        'processing',
        'completed',
        'failed',
        'not_applicable',
        'manual_review'
      )
    ),
  angle_slot integer
    CHECK (angle_slot IS NULL OR (angle_slot >= 1 AND angle_slot <= 10)),
  ai_quality_score numeric(5, 2),
  approved boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'guided'
    CHECK (source IN ('guided', 'desktop_upload')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_listing_id ON public.photos (listing_id);
CREATE INDEX idx_photos_plate_status ON public.photos (plate_cover_status)
  WHERE plate_cover_status IN ('pending', 'manual_review');

CREATE TRIGGER photos_set_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Public-safe view: never exposes storage_path or plate_bbox (real plate data)
CREATE VIEW public.photos_public
WITH (security_invoker = true) AS
SELECT
  id,
  listing_id,
  processed_path,
  plate_detected,
  plate_cover_status,
  angle_slot,
  ai_quality_score,
  approved,
  source,
  created_at,
  updated_at
FROM public.photos;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
