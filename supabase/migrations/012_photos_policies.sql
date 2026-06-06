-- VeloxLane: photo delete policy + listing photos_count sync

CREATE POLICY photos_delete_seller
  ON public.photos
  FOR DELETE
  TO authenticated
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = photos.listing_id
        AND l.seller_id = (SELECT auth.uid())
        AND l.status = 'draft'
    )
  );

CREATE OR REPLACE FUNCTION public.sync_listing_photos_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_listing_id uuid;
BEGIN
  target_listing_id := COALESCE(NEW.listing_id, OLD.listing_id);

  UPDATE public.listings
  SET photos_count = (
    SELECT count(*)
    FROM public.photos
    WHERE listing_id = target_listing_id
  )
  WHERE id = target_listing_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER photos_sync_count_insert
  AFTER INSERT ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_listing_photos_count();

CREATE TRIGGER photos_sync_count_delete
  AFTER DELETE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_listing_photos_count();
