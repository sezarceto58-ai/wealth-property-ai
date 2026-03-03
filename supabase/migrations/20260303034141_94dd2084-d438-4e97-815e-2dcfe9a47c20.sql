
-- Step 1: Add 'developer' to the app_role enum (must be in its own transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';
