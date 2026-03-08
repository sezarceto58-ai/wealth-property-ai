
-- restaurants table (tenants)
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  country text DEFAULT 'Iraq',
  cuisine_type text,
  currency text DEFAULT 'USD',
  language text DEFAULT 'en',
  logo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','trial')),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','elite')),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- restaurant_users junction
CREATE TABLE public.restaurant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;

-- ingredients
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  unit text,
  cost_per_unit numeric DEFAULT 0,
  stock_level numeric DEFAULT 0,
  min_threshold numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- recipes
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  selling_price numeric DEFAULT 0,
  food_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- inventory_items
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  stock_level numeric DEFAULT 0,
  unit text,
  min_threshold numeric DEFAULT 0,
  status text DEFAULT 'in_stock' CHECK (status IN ('in_stock','low_stock','out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- sales_rows
CREATE TABLE public.sales_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  item_name text,
  quantity integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  sale_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.sales_rows ENABLE ROW LEVEL SECURITY;

-- ai_calls_log
CREATE TABLE public.ai_calls_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  prompt_type text,
  status text DEFAULT 'success' CHECK (status IN ('success','failed','partial')),
  tokens_used integer DEFAULT 0,
  cost numeric DEFAULT 0,
  error_message text,
  provider text,
  model text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ai_calls_log ENABLE ROW LEVEL SECURITY;

-- ai_insights
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  insight_type text,
  content jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- import_jobs
CREATE TABLE public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  import_type text NOT NULL CHECK (import_type IN ('sales','ingredients','inventory','recipes')),
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('completed','failed','processing','partial')),
  rows_total integer DEFAULT 0,
  rows_failed integer DEFAULT 0,
  error_details jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer
);
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- tenant audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- platform_admin_users
CREATE TABLE public.platform_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','support','analyst')),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.platform_admin_users ENABLE ROW LEVEL SECURITY;

-- platform_audit_logs
CREATE TABLE public.platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text,
  target_id text,
  reason text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- platform_feature_flags
CREATE TABLE public.platform_feature_flags (
  key text PRIMARY KEY,
  description text,
  default_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;

-- tenant_feature_flags
CREATE TABLE public.tenant_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  flag_key text REFERENCES public.platform_feature_flags(key) NOT NULL,
  enabled boolean NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, flag_key)
);
ALTER TABLE public.tenant_feature_flags ENABLE ROW LEVEL SECURITY;

-- tenant_limits
CREATE TABLE public.tenant_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','elite')),
  ingredients_limit integer,
  recipes_limit integer,
  inventory_limit integer,
  ai_quota_monthly integer,
  custom_overrides jsonb DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

-- platform_notifications
CREATE TABLE public.platform_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  target_plan text,
  target_city text,
  target_activity_days integer,
  channel text DEFAULT 'email' CHECK (channel IN ('email','push','whatsapp')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent','failed')),
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;

-- platform_settings (key-value)
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- prompt_templates
CREATE TABLE public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  content text NOT NULL,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_key, version)
);
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admin_users
    WHERE user_id = _user_id AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.platform_admin_users
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;
$$;

-- RLS policies for admin tables (admin-only access)
CREATE POLICY "Platform admins full access" ON public.platform_admin_users FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.platform_audit_logs FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.platform_feature_flags FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.tenant_feature_flags FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.tenant_limits FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.platform_notifications FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.platform_settings FOR ALL USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins full access" ON public.prompt_templates FOR ALL USING (public.is_platform_admin(auth.uid()));

-- Admin read access to tenant tables
CREATE POLICY "Platform admins read restaurants" ON public.restaurants FOR SELECT USING (public.is_platform_admin(auth.uid()) OR owner_user_id = auth.uid());
CREATE POLICY "Platform admins update restaurants" ON public.restaurants FOR UPDATE USING (public.is_platform_admin(auth.uid()) OR owner_user_id = auth.uid());
CREATE POLICY "Owners insert restaurants" ON public.restaurants FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Platform admins read all" ON public.restaurant_users FOR SELECT USING (public.is_platform_admin(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Platform admins read all" ON public.ingredients FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.recipes FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.inventory_items FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.sales_rows FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.ai_calls_log FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.ai_insights FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.import_jobs FOR SELECT USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins read all" ON public.audit_logs FOR SELECT USING (public.is_platform_admin(auth.uid()));

-- Tenant users access their own data
CREATE POLICY "Tenant users manage ingredients" ON public.ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = ingredients.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users manage recipes" ON public.recipes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = recipes.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users manage inventory" ON public.inventory_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = inventory_items.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users manage sales" ON public.sales_rows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = sales_rows.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users view ai_calls" ON public.ai_calls_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = ai_calls_log.tenant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users view ai_insights" ON public.ai_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = ai_insights.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users view imports" ON public.import_jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = import_jobs.tenant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users view audit" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.restaurant_users ru WHERE ru.restaurant_id = audit_logs.restaurant_id AND ru.user_id = auth.uid())
);
CREATE POLICY "Tenant users manage restaurant_users" ON public.restaurant_users FOR ALL USING (user_id = auth.uid());

-- Seed platform_feature_flags
INSERT INTO public.platform_feature_flags (key, description, default_enabled) VALUES
  ('loyalty_tiers', 'Loyalty tiers feature', false),
  ('advanced_promotions', 'Advanced promo engine', true),
  ('competitor_tracking', 'Competitor price tracking', false),
  ('smart_kitchen', 'Smart kitchen costing', false),
  ('daily_ai_notifications', 'Daily AI push notifications', false),
  ('inventory_module', 'Inventory tracking module', false),
  ('supplier_management', 'Supplier management module', false);

-- Seed platform_settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('ai_globally_enabled', '"true"'),
  ('ai_global_daily_cost_cap', '50'),
  ('ai_global_monthly_cost_cap', '1000'),
  ('ai_global_max_calls_per_minute', '60');

-- Seed prompt_templates
INSERT INTO public.prompt_templates (template_key, version, content, is_active) VALUES
  ('pricing_prompt', 1, 'You are a pricing analyst...', true),
  ('promotion_prompt', 1, 'You are a marketing specialist...', true),
  ('menu_opt_prompt', 1, 'You are a menu optimization expert...', true);
