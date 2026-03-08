import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  action: string;
  targetType?: string;
  targetId?: string;
  reason: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export async function logAdminAction(entry: AuditLogEntry) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("platform_audit_logs").insert([{
    actor_user_id: user.id,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    reason: entry.reason,
    before_data: (entry.before as any) ?? null,
    after_data: (entry.after as any) ?? null,
    ip_address: null,
    user_agent: navigator.userAgent,
  }]);

  if (error) console.error("Audit log failed:", error);
}
