-- VeloxLane: Row Level Security policies (single review file)
-- Reference: Docs/VeloxLane_Dev_Guide.html § 06

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER — only consult auth.uid(), no parameters)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_active_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Privilege guards (triggers complement RLS)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.risk_score := OLD.risk_score;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();

CREATE OR REPLACE FUNCTION public.protect_offer_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'accepted' AND NOT public.is_admin() THEN
    NEW.amount := OLD.amount;
    NEW.buyer_id := OLD.buyer_id;
    NEW.seller_id := OLD.seller_id;
    NEW.listing_id := OLD.listing_id;
    NEW.escrow_txn_id := OLD.escrow_txn_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER offers_protect_accepted_fields
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_offer_fields();

-- ---------------------------------------------------------------------------
-- profiles
-- User reads own row. Admin reads all. Banned users cannot write.
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY profiles_select_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    AND public.is_active_user()
  )
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- listings
-- Public read on status=active. Seller writes own. No edits during open offers.
-- ---------------------------------------------------------------------------

CREATE POLICY listings_select_active
  ON public.listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY listings_select_own
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

CREATE POLICY listings_select_admin
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY listings_insert_seller
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = (SELECT auth.uid())
    AND public.is_active_user()
  );

CREATE POLICY listings_update_seller
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (
    seller_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND NOT EXISTS (
      SELECT 1
      FROM public.offers o
      WHERE o.listing_id = listings.id
        AND o.status IN ('pending', 'countered', 'accepted')
    )
  )
  WITH CHECK (
    seller_id = (SELECT auth.uid())
    AND public.is_active_user()
  );

CREATE POLICY listings_update_admin
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- photos
-- Public reads processed_path via photos_public view. Original path owner/admin only.
-- ---------------------------------------------------------------------------

CREATE POLICY photos_select_active_listing
  ON public.photos
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = photos.listing_id
        AND l.status = 'active'
    )
  );

CREATE POLICY photos_select_owner
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = photos.listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY photos_select_admin
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY photos_insert_seller
  ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_active_user()
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY photos_update_seller
  ON public.photos
  FOR UPDATE
  TO authenticated
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = photos.listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    public.is_active_user()
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = photos.listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY photos_update_admin
  ON public.photos
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- unlocks
-- Buyer + seller read. Insert via webhook (service_role) only — no client INSERT.
-- ---------------------------------------------------------------------------

CREATE POLICY unlocks_select_buyer
  ON public.unlocks
  FOR SELECT
  TO authenticated
  USING (buyer_id = (SELECT auth.uid()));

CREATE POLICY unlocks_select_seller
  ON public.unlocks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = unlocks.listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY unlocks_select_admin
  ON public.unlocks
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- offers
-- Buyer + seller read/write own. No self-deals (CHECK). Webhook sets escrow link.
-- ---------------------------------------------------------------------------

CREATE POLICY offers_select_participant
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  );

CREATE POLICY offers_select_admin
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY offers_insert_buyer
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_id
        AND l.status = 'active'
        AND l.seller_id = seller_id
        AND l.seller_id <> (SELECT auth.uid())
    )
  );

CREATE POLICY offers_update_buyer
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND status IN ('pending', 'countered')
  )
  WITH CHECK (
    buyer_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND status IN ('pending', 'countered', 'withdrawn')
  );

CREATE POLICY offers_update_seller
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (
    seller_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND status IN ('pending', 'countered')
  )
  WITH CHECK (
    seller_id = (SELECT auth.uid())
    AND public.is_active_user()
    AND status IN ('pending', 'countered', 'accepted', 'declined')
  );

CREATE POLICY offers_update_admin
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- escrow_transactions
-- Buyer + seller read. Insert/update via webhook (service_role) only.
-- ---------------------------------------------------------------------------

CREATE POLICY escrow_select_participant
  ON public.escrow_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.offers o
      WHERE o.id = escrow_transactions.offer_id
        AND (
          o.buyer_id = (SELECT auth.uid())
          OR o.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY escrow_select_admin
  ON public.escrow_transactions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- message_threads
-- Participants only. Thread creation requires prior unlock.
-- ---------------------------------------------------------------------------

CREATE POLICY message_threads_select_participant
  ON public.message_threads
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  );

CREATE POLICY message_threads_insert_participant
  ON public.message_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_active_user()
    AND (
      buyer_id = (SELECT auth.uid())
      OR seller_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1
      FROM public.unlocks u
      WHERE u.listing_id = message_threads.listing_id
        AND u.buyer_id = message_threads.buyer_id
    )
  );

CREATE POLICY message_threads_select_admin
  ON public.message_threads
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- messages
-- Thread participants only.
-- ---------------------------------------------------------------------------

CREATE POLICY messages_select_participant
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.message_threads t
      WHERE t.id = messages.thread_id
        AND (
          t.buyer_id = (SELECT auth.uid())
          OR t.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY messages_insert_participant
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_active_user()
    AND sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.message_threads t
      WHERE t.id = thread_id
        AND (
          t.buyer_id = (SELECT auth.uid())
          OR t.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY messages_select_admin
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- bill_of_sale
-- Buyer + seller read. Generated server-side — no client writes.
-- ---------------------------------------------------------------------------

CREATE POLICY bill_of_sale_select_participant
  ON public.bill_of_sale
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.offers o
      WHERE o.id = bill_of_sale.offer_id
        AND (
          o.buyer_id = (SELECT auth.uid())
          OR o.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY bill_of_sale_select_admin
  ON public.bill_of_sale
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- inspections
-- Buyer + seller read (via listing ownership or unlock). Server writes.
-- ---------------------------------------------------------------------------

CREATE POLICY inspections_select_seller
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = inspections.listing_id
        AND l.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY inspections_select_buyer
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.unlocks u
      WHERE u.listing_id = inspections.listing_id
        AND u.buyer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY inspections_select_admin
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- affiliate_clicks
-- Admin only.
-- ---------------------------------------------------------------------------

CREATE POLICY affiliate_clicks_admin_all
  ON public.affiliate_clicks
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- audit_log
-- Admin read only. Inserts via SECURITY DEFINER triggers / service_role.
-- Immutable: no UPDATE or DELETE policies.
-- ---------------------------------------------------------------------------

CREATE POLICY audit_log_select_admin
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants + public photo view
-- ---------------------------------------------------------------------------

GRANT SELECT ON public.photos_public TO anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
