import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [totalTenants, activeTenants, suspendedTenants, newToday, importsToday, failedImports, aiCallsToday, failedAiToday, byPlan] = await Promise.all([
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("restaurants").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("restaurants").select("id", { count: "exact", head: true }).eq("status", "suspended"),
        supabase.from("restaurants").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        supabase.from("import_jobs").select("id", { count: "exact", head: true }).gte("started_at", todayISO),
        supabase.from("import_jobs").select("id", { count: "exact", head: true }).gte("started_at", todayISO).eq("status", "failed"),
        supabase.from("ai_calls_log").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        supabase.from("ai_calls_log").select("id", { count: "exact", head: true }).gte("created_at", todayISO).eq("status", "failed"),
        supabase.from("restaurants").select("plan"),
      ]);

      const planCounts = { free: 0, pro: 0, elite: 0 };
      (byPlan.data ?? []).forEach((r: any) => {
        if (r.plan in planCounts) planCounts[r.plan as keyof typeof planCounts]++;
      });

      return {
        totalTenants: totalTenants.count ?? 0,
        activeTenants: activeTenants.count ?? 0,
        suspendedTenants: suspendedTenants.count ?? 0,
        newToday: newToday.count ?? 0,
        importsToday: importsToday.count ?? 0,
        failedImports: failedImports.count ?? 0,
        aiCallsToday: aiCallsToday.count ?? 0,
        failedAiToday: failedAiToday.count ?? 0,
        planCounts,
      };
    },
    refetchInterval: 60000,
  });
}
