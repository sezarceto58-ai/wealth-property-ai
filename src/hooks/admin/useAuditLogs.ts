import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogFilters {
  source?: "platform" | "tenant" | "all";
  tenantId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export function usePlatformAuditLogs(filters: AuditLogFilters = {}) {
  const { action, dateFrom, dateTo, page = 1, pageSize = 25 } = filters;
  return useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: async () => {
      let q = supabase.from("platform_audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
      if (action) q = q.ilike("action", `%${action}%`);
      if (dateFrom) q = q.gte("created_at", dateFrom);
      if (dateTo) q = q.lte("created_at", dateTo);
      q = q.range((page - 1) * pageSize, page * pageSize - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}

export function useTenantAuditLogs(tenantId: string, filters: AuditLogFilters = {}) {
  const { page = 1, pageSize = 25 } = filters;
  return useQuery({
    queryKey: ["admin-tenant-audit-logs", tenantId, filters],
    queryFn: async () => {
      let q = supabase.from("audit_logs").select("*", { count: "exact" }).eq("restaurant_id", tenantId).order("created_at", { ascending: false });
      q = q.range((page - 1) * pageSize, page * pageSize - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
    enabled: !!tenantId,
  });
}
