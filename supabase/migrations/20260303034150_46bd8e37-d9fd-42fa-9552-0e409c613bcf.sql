
-- Create project_plans table for developer feasibility planning
CREATE TABLE public.project_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    land_location JSONB NOT NULL,
    land_area FLOAT NOT NULL,
    shape VARCHAR(50) DEFAULT 'rectangle',
    max_floors INT DEFAULT 10,
    restrictions TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft',
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
ON public.project_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
ON public.project_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON public.project_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
ON public.project_plans FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_project_plans_updated_at
BEFORE UPDATE ON public.project_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users can insert their own buyer or seller role" ON public.user_roles;
CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND (role = ANY (ARRAY['buyer'::app_role, 'seller'::app_role, 'developer'::app_role])));
