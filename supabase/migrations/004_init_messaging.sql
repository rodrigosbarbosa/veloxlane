-- VeloxLane: message_threads, messages + Realtime

CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings (id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  seller_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_threads_buyer_not_seller CHECK (buyer_id <> seller_id),
  CONSTRAINT message_threads_listing_buyer_seller_unique UNIQUE (listing_id, buyer_id, seller_id)
);

CREATE INDEX idx_message_threads_buyer_id ON public.message_threads (buyer_id);
CREATE INDEX idx_message_threads_seller_id ON public.message_threads (seller_id);
CREATE INDEX idx_message_threads_listing_id ON public.message_threads (listing_id);

CREATE TRIGGER message_threads_set_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads (id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  body text NOT NULL
    CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_thread_created_at ON public.messages (thread_id, created_at);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);

CREATE TRIGGER messages_set_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Realtime subscriptions per thread
ALTER TABLE public.message_threads REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
