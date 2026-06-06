-- VeloxLane: unlocks, offers, escrow_transactions

CREATE TABLE public.unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  stripe_payment_intent text,
  amount numeric(12, 2) NOT NULL
    CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unlocks_listing_id ON public.unlocks (listing_id);
CREATE INDEX idx_unlocks_buyer_id ON public.unlocks (buyer_id);

CREATE TRIGGER unlocks_set_updated_at
  BEFORE UPDATE ON public.unlocks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  seller_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL
    CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'accepted',
        'declined',
        'countered',
        'expired',
        'withdrawn'
      )
    ),
  counter_amount numeric(12, 2)
    CHECK (counter_amount IS NULL OR counter_amount >= 0),
  escrow_txn_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offers_buyer_not_seller CHECK (buyer_id <> seller_id)
);

CREATE INDEX idx_offers_listing_status ON public.offers (listing_id, status);
CREATE INDEX idx_offers_buyer_id ON public.offers (buyer_id);
CREATE INDEX idx_offers_seller_id ON public.offers (seller_id);

CREATE TRIGGER offers_set_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES public.offers (id) ON DELETE SET NULL,
  escrow_com_id text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'funded',
        'released',
        'cancelled',
        'disputed'
      )
    ),
  amount numeric(12, 2) NOT NULL
    CHECK (amount >= 0),
  funded_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_escrow_offer_id ON public.escrow_transactions (offer_id);
CREATE INDEX idx_escrow_status ON public.escrow_transactions (status);

ALTER TABLE public.offers
  ADD CONSTRAINT offers_escrow_txn_id_fkey
  FOREIGN KEY (escrow_txn_id) REFERENCES public.escrow_transactions (id)
  ON DELETE SET NULL;

CREATE TRIGGER escrow_transactions_set_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
