-- VeloxLane: rename the Phase 2 'carfax_bundle' payment type to
-- 'autocheck_bundle' (see docs/decisions/0002-autocheck-vehicle-history.md).
--
-- Money-table guardrails (.cursor/rules/20-data-and-money.mdc):
-- - No amounts, statuses, stripe_payment_intent values, or RLS policies change.
-- - Existing rows are NOT rewritten; 'carfax_bundle' stays valid in the CHECK
--   so any historical rows keep passing the constraint. Phase 2 is not
--   implemented, so no new rows of either value can be charged yet
--   (getAmountCents rejects Phase 2 types server-side).
-- - Application code (packages/schemas, packages/payments) now emits only
--   'autocheck_bundle'.

ALTER TABLE public.payments
  DROP CONSTRAINT payments_type_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_type_check
    CHECK (
      type IN (
        'listing',
        'unlock',
        'featured',
        'autocheck_bundle',
        'carfax_bundle', -- legacy value; remove once confirmed unused in prod
        'buyer_protection'
      )
    );
