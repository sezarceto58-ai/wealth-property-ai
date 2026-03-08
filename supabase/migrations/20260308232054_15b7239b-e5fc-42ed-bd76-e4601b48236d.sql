
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Allow inserts from service role / edge functions (no INSERT policy for anon/authenticated needed - handled server-side)
-- But we need an insert policy for triggers/functions that run as the user
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read) WHERE read = false;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: create notification on new offer
CREATE OR REPLACE FUNCTION public.notify_on_new_offer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Notify seller about new offer
  IF NEW.seller_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.seller_id,
      'offer',
      'New Offer Received',
      'You received an offer of ' || NEW.offer_price || ' ' || COALESCE(NEW.currency, 'USD'),
      '/seller/offers'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_offer
AFTER INSERT ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_offer();

-- Trigger function: notify on offer status change
CREATE OR REPLACE FUNCTION public.notify_on_offer_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.buyer_id,
      'offer',
      'Offer ' || NEW.status,
      'Your offer has been updated to: ' || NEW.status,
      '/buyer/offers'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_offer_status
AFTER UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.notify_on_offer_status_change();

-- Trigger: notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    NEW.recipient_id,
    'message',
    'New Message',
    LEFT(NEW.content, 80),
    '/buyer/messages'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();

-- Trigger: notify on verification status change
CREATE OR REPLACE FUNCTION public.notify_on_verification_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'verification',
      'Verification ' || NEW.status,
      'Your ' || NEW.verification_type || ' verification is now: ' || NEW.status,
      '/seller/verification'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_verification_change
AFTER UPDATE ON public.seller_verifications
FOR EACH ROW EXECUTE FUNCTION public.notify_on_verification_change();
