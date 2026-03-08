import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export interface TenantFilters {
  search?: string;
  plan?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export function useTenants(filters: TenantFilters = {}) {
  const { search, plan, status, page = 1, pageSize = 25 } = filters;
  return useQuery({
    queryKey: ["admin-tenants", filters],
    queryFn: async () => {
      let q = supabase.from("restaurants").select("*", { count: "exact" });
      if (search) q = q.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
      if (plan && plan !== "all") q = q.eq("plan", plan);
      if (status && status !== "all") q = q.eq("status", status);
      q = q.order("created_at", { ascending: false });
      q = q.range((page - 1) * pageSize, page * pageSize - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useTenantUsage(tenantId: string) {
  return useQuery({
    queryKey: ["admin-tenant-usage", tenantId],
    queryFn: async () => {
      const [ingredients, recipes, inventory, aiCalls, imports] = await Promise.all([
        supabase.from("ingredients").select("id", { count: "exact", head: true }).eq("restaurant_id", tenantId),
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("restaurant_id", tenantId),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("restaurant_id", tenantId),
        supabase.from("ai_calls_log").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("import_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("started_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);
      return {
        ingredients: ingredients.count ?? 0,
        recipes: recipes.count ?? 0,
        inventory: inventory.count ?? 0,
        aiCalls: aiCalls.count ?? 0,
        imports: imports.count ?? 0,
      };
    },
    enabled: !!tenantId,
  });
}

export function useUpdateTenantPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, newPlan, reason }: { tenantId: string; newPlan: string; reason: string }) => {
      const { data: old } = await supabase.from("restaurants").select("plan").eq("id", tenantId).single();
      const { error } = await supabase.from("restaurants").update({ plan: newPlan }).eq("id", tenantId);
      if (error) throw error;
      await logAdminAction({ action: "tenant_plan_changed", targetType: "tenant", targetId: tenantId, reason, before: { plan: old?.plan }, after: { plan: newPlan } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tenant"] }); qc.invalidateQueries({ queryKey: ["admin-tenants"] }); },
  });
}

export function useSuspendTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, suspend, reason }: { tenantId: string; suspend: boolean; reason: string }) => {
      const newStatus = suspend ? "suspended" : "active";
      const { error } = await supabase.from("restaurants").update({ status: newStatus }).eq("id", tenantId);
      if (error) throw error;
      await logAdminAction({ action: suspend ? "tenant_suspended" : "tenant_resumed", targetType: "tenant", targetId: tenantId, reason });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tenant"] }); qc.invalidateQueries({ queryKey: ["admin-tenants"] }); },
  });
}
