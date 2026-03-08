import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;

      // Verify admin status
      const { data: adminUser, error: adminErr } = await supabase
        .from("platform_admin_users")
        .select("role, is_active")
        .eq("user_id", data.user.id)
        .single();

      if (adminErr || !adminUser) {
        await supabase.auth.signOut();
        setError("This account does not have admin access.");
        return;
      }

      if (!adminUser.is_active) {
        await supabase.auth.signOut();
        setError("This admin account has been suspended.");
        return;
      }

      // Update last login
      await supabase.from("platform_admin_users").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);

      toast.success("Welcome back, admin!");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-[#6366f1] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">SM</div>
          <h1 className="text-2xl font-bold text-white">SmartMenu</h1>
          <p className="text-[#6b7280] text-sm">Owner Console</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm rounded-lg p-3">{error}</div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-[#6b7280]">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@smartmenu.io" className="bg-[#0f1117] border-[#2a2d3a] text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#6b7280]">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-[#0f1117] border-[#2a2d3a] text-white" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#6366f1] hover:bg-[#4f46e5]">
            {loading ? "Signing in..." : "Sign In Securely"}
          </Button>
        </form>
      </div>
    </div>
  );
}
