import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export function usePlatformFlags() {
  return useQuery({
    queryKey: ["admin-platform-flags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_feature_flags").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantFlags(tenantId: string) {
  return useQuery({
    queryKey: ["admin-tenant-flags", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_feature_flags").select("*").eq("tenant_id", tenantId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useToggleFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, flagKey, enabled, reason }: { tenantId: string; flagKey: string; enabled: boolean; reason: string }) => {
      const { data: existing } = await supabase.from("tenant_feature_flags").select("id").eq("tenant_id", tenantId).eq("flag_key", flagKey).single();
      if (existing) {
        await supabase.from("tenant_feature_flags").update({ enabled }).eq("id", existing.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("tenant_feature_flags").insert({ tenant_id: tenantId, flag_key: flagKey, enabled, updated_by: user?.id });
      }
      await logAdminAction({ action: "feature_flag_toggled_tenant", targetType: "tenant_flag", targetId: `${tenantId}:${flagKey}`, reason, after: { enabled } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tenant-flags"] }); qc.invalidateQueries({ queryKey: ["admin-platform-flags"] }); },
  });
}

export function useToggleGlobalFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ flagKey, defaultEnabled, reason }: { flagKey: string; defaultEnabled: boolean; reason: string }) => {
      await supabase.from("platform_feature_flags").update({ default_enabled: defaultEnabled }).eq("key", flagKey);
      await logAdminAction({ action: "feature_flag_toggled_global", targetType: "platform_flag", targetId: flagKey, reason, after: { default_enabled: defaultEnabled } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-platform-flags"] }); },
  });
}
