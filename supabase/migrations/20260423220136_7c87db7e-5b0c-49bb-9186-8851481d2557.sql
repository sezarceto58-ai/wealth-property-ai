CREATE OR REPLACE FUNCTION public.consume_usage(p_metric text, p_amount integer DEFAULT 1)
RETURNS TABLE(
  plan text,
  metric text,
  "limit" integer,
  used integer,
  remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_plan text := 'free';
  v_limit integer := NULL;
  v_used integer := 0;
  v_status text := 'inactive';
  v_product_id text := NULL;
  v_period_start timestamptz := date_trunc('month', now());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT s.status, s.product_id
  INTO v_status, v_product_id
  FROM public.subscriptions s
  WHERE s.user_id = v_user_id
  ORDER BY s.updated_at DESC NULLS LAST, s.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_status IN ('active', 'trialing') THEN
    IF v_product_id IN ('prod_U71hrCs7w7d5RJ', 'prod_U71G3QywWMxBVI') THEN
      v_plan := 'pro';
    ELSIF v_product_id IN ('prod_U71iMcFlnsDksb', 'prod_U71Y9YCOPDel4X') THEN
      v_plan := 'elite';
    ELSE
      v_plan := 'free';
    END IF;
  END IF;

  v_limit := CASE
    WHEN p_metric = 'offer_create' AND v_plan = 'free' THEN 3
    ELSE NULL
  END;

  SELECT COUNT(*)::integer
  INTO v_used
  FROM public.usage_logs ul
  WHERE ul.user_id = v_user_id
    AND ul.function_name = p_metric
    AND ul.called_at >= v_period_start;

  IF v_limit IS NOT NULL AND (v_used + p_amount) > v_limit THEN
    RAISE EXCEPTION 'Usage limit exceeded for % on % plan', p_metric, v_plan;
  END IF;

  INSERT INTO public.usage_logs (user_id, function_name)
  SELECT v_user_id, p_metric
  FROM generate_series(1, GREATEST(p_amount, 0));

  v_used := v_used + GREATEST(p_amount, 0);

  RETURN QUERY
  SELECT
    v_plan,
    p_metric,
    v_limit,
    v_used,
    CASE WHEN v_limit IS NULL THEN NULL ELSE GREATEST(v_limit - v_used, 0) END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_usage(text, integer) TO authenticated;