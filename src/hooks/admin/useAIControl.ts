import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export function useAISettings() {
  return useQuery({
    queryKey: ["admin-ai-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings").select("*");
      if (error) throw error;
      const settings: Record<string, any> = {};
      (data ?? []).forEach((s: any) => { settings[s.key] = s.value; });
      return settings;
    },
  });
}

export function useUpdateAISetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, reason }: { key: string; value: any; reason: string }) => {
      const { data: old } = await supabase.from("platform_settings").select("value").eq("key", key).single();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("platform_settings").update({ value, updated_by: user?.id }).eq("key", key);
      await logAdminAction({ action: key === "ai_globally_enabled" ? "ai_kill_switch_toggled" : "ai_settings_updated", targetType: "platform_settings", targetId: key, reason, before: { value: old?.value }, after: { value } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-ai-settings"] }); },
  });
}

export function useAIErrors(filters: { page?: number } = {}) {
  const { page = 1 } = filters;
  return useQuery({
    queryKey: ["admin-ai-errors", filters],
    queryFn: async () => {
      const { data, count, error } = await supabase.from("ai_calls_log").select("*, restaurants(name)", { count: "exact" }).eq("status", "failed").order("created_at", { ascending: false }).range((page - 1) * 20, page * 20 - 1);
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}

export function usePromptTemplates() {
  return useQuery({
    queryKey: ["admin-prompt-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("prompt_templates").select("*").order("template_key").order("version", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
