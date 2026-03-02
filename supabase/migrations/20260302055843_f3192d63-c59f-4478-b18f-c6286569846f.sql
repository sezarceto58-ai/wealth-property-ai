-- Create secure role enum for application authorization
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('buyer', 'seller', 'admin');
  END IF;
END$$;

-- Create dedicated user roles table (separate from auth/profile metadata)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
);

-- Performance index for role lookups during auth routing
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- Enable row-level security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read only their own role mapping
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own role'
  ) THEN
    CREATE POLICY "Users can view their own role"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END$$;

-- Users can create only their own non-admin role mapping
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can insert their own buyer or seller role'
  ) THEN
    CREATE POLICY "Users can insert their own buyer or seller role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role IN ('buyer', 'seller'));
  END IF;
END$$;

-- Server-side role checker to avoid recursive RLS issues in other policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Backfill existing users from auth metadata (buyer/seller/admin)
INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN u.raw_user_meta_data ->> 'role' = 'seller' THEN 'seller'::public.app_role
    WHEN u.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'::public.app_role
    ELSE 'buyer'::public.app_role
  END
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;