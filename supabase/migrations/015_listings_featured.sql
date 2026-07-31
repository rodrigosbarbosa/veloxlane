-- VeloxLane: featured-listing window (fulfilled by the paid `featured` platform fee)

-- A listing is "featured" while now() < featured_until. Set by the Stripe webhook
-- on a successful `featured` payment (service_role only) — never client-writable.
ALTER TABLE public.listings
  ADD COLUMN featured_until timestamptz;

-- Supports "active featured listings" queries for the browse surface.
CREATE INDEX idx_listings_featured_until ON public.listings (featured_until)
  WHERE featured_until IS NOT NULL;

-- Privilege guard: status, published_at, and featured_until are all set by paid
-- platform fees (listing activation, featured upgrade) fulfilled through the
-- Stripe webhook (service_role). Freeze them from ordinary clients so a seller
-- cannot self-activate or self-feature a listing without paying. Complements
-- the column-agnostic listings_update_seller RLS policy in migration 008.
CREATE OR REPLACE FUNCTION public.protect_listing_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role'
    AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'draft';
      NEW.published_at := NULL;
      NEW.featured_until := NULL;
    ELSE
      NEW.status := OLD.status;
      NEW.published_at := OLD.published_at;
      NEW.featured_until := OLD.featured_until;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_protect_privileged_fields
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_listing_privileged_fields();
