import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type PlanTier = "free" | "pro" | "elite";

export function createUserClient(token: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );
}

export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
}

/**
 * Consume monthly usage for a metric.
 * This is enforced in Postgres via the consume_usage() RPC.
 */
export async function consumeUsage(token: string, metric: string, amount = 1) {
  const userClient = createUserClient(token);
  const { data, error } = await userClient.rpc("consume_usage", {
    p_metric: metric,
    p_amount: amount,
  });

  if (error) {
    // Standardize a clear error for the frontend.
    // Postgres exception message will be forwarded in error.message.
    throw new Error(error.message || "Usage limit exceeded");
  }

  return data as { plan: PlanTier; metric: string; limit: number | null; used: number; remaining: number | null };
}
