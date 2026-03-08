import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImportFilters {
  tenantId?: string;
  importType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useImportJobs(filters: ImportFilters = {}) {
  const { tenantId, importType, status, page = 1, pageSize = 25 } = filters;
  return useQuery({
    queryKey: ["admin-import-jobs", filters],
    queryFn: async () => {
      let q = supabase.from("import_jobs").select("*, restaurants(name)", { count: "exact" }).order("started_at", { ascending: false });
      if (tenantId) q = q.eq("tenant_id", tenantId);
      if (importType && importType !== "all") q = q.eq("import_type", importType);
      if (status && status !== "all") q = q.eq("status", status);
      q = q.range((page - 1) * pageSize, page * pageSize - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}
