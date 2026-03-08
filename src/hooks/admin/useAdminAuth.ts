import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AdminRole = "owner" | "support" | "analyst";

interface AdminAuthState {
  user: User | null;
  role: AdminRole | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("platform_admin_users")
          .select("role, is_active")
          .eq("user_id", u.id)
          .single();
        if (data?.is_active) {
          setRole(data.role as AdminRole);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("platform_admin_users")
          .select("role, is_active")
          .eq("user_id", u.id)
          .single();
        if (data?.is_active) {
          setRole(data.role as AdminRole);
        } else {
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    role,
    isAdmin: !!role,
    loading,
    signOut: async () => { await supabase.auth.signOut(); },
  };
}

export function canAccess(role: AdminRole | null, feature: string): boolean {
  if (!role) return false;
  const perms: Record<string, AdminRole[]> = {
    view_all: ["owner", "support", "analyst"],
    change_plan: ["owner", "support"],
    suspend_tenant: ["owner", "support"],
    manage_flags: ["owner"],
    ai_kill_switch: ["owner"],
    export_audit: ["owner", "support"],
    send_notifications: ["owner", "support"],
    manage_admins: ["owner"],
  };
  return perms[feature]?.includes(role) ?? false;
}
