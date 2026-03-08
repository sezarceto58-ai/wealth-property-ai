import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  latency?: number;
  message: string;
  lastChecked: string;
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["admin-system-health"],
    queryFn: async (): Promise<HealthCheck[]> => {
      const checks: HealthCheck[] = [];
      const now = new Date().toISOString();

      // DB ping
      const dbStart = Date.now();
      const { error: dbErr } = await supabase.from("restaurants").select("id").limit(1);
      checks.push({
        name: "Database",
        status: dbErr ? "error" : "healthy",
        latency: Date.now() - dbStart,
        message: dbErr ? dbErr.message : "Connected",
        lastChecked: now,
      });

      // Auth ping
      const authStart = Date.now();
      const { error: authErr } = await supabase.auth.getSession();
      checks.push({
        name: "Authentication",
        status: authErr ? "error" : "healthy",
        latency: Date.now() - authStart,
        message: authErr ? authErr.message : "Operational",
        lastChecked: now,
      });

      // Check recent imports
      const { count: processingCount } = await supabase.from("import_jobs").select("id", { count: "exact", head: true }).eq("status", "processing");
      checks.push({
        name: "Import Queue",
        status: (processingCount ?? 0) > 10 ? "warning" : "healthy",
        message: `${processingCount ?? 0} jobs processing`,
        lastChecked: now,
      });

      // AI status
      const { data: aiSetting } = await supabase.from("platform_settings").select("value").eq("key", "ai_globally_enabled").single();
      const aiEnabled = aiSetting?.value === "true" || aiSetting?.value === true;
      checks.push({
        name: "AI Services",
        status: aiEnabled ? "healthy" : "warning",
        message: aiEnabled ? "AI globally enabled" : "AI globally disabled",
        lastChecked: now,
      });

      return checks;
    },
    refetchInterval: 30000,
  });
}
