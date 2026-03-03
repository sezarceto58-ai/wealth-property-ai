import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin, Plus, BarChart3, FileText, TrendingUp,
  Building2, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanRow = {
  id: string;
  land_area: number;
  land_location: { lat: number; lng: number };
  status: string;
  shape: string;
  max_floors: number;
  result: any;
  created_at: string;
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  draft: { icon: FileText, color: "text-muted-foreground", label: "Draft" },
  processing: { icon: Clock, color: "text-warning", label: "Processing" },
  complete: { icon: CheckCircle2, color: "text-success", label: "Complete" },
  error: { icon: AlertCircle, color: "text-destructive", label: "Error" },
};

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase
        .from("project_plans" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10) as any);
      setPlans((data as PlanRow[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const completedPlans = plans.filter((p) => p.status === "complete");
  const avgROI = completedPlans.length
    ? (completedPlans.reduce((s, p) => s + (p.result?.financials?.roi_pct || 0), 0) / completedPlans.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Developer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered land feasibility planning at a glance.</p>
        </div>
        <Link to="/developer/analyze">
          <Button className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Plans", value: plans.length, icon: FileText, color: "text-primary" },
          { title: "Completed", value: completedPlans.length, icon: CheckCircle2, color: "text-success" },
          { title: "Avg ROI", value: `${avgROI}%`, icon: TrendingUp, color: "text-warning" },
          { title: "Processing", value: plans.filter((p) => p.status === "processing").length, icon: Clock, color: "text-info" },
        ].map((stat) => (
          <div key={stat.title} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-card ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Recent Plans
          </h2>
          <Link to="/developer/plans" className="text-xs text-primary hover:underline">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No plans yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start your first AI land analysis to see results here.</p>
            <Link to="/developer/analyze">
              <Button className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Create First Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const st = statusConfig[plan.status] || statusConfig.draft;
              const StIcon = st.icon;
              return (
                <Link
                  key={plan.id}
                  to={`/developer/plan/${plan.id}`}
                  className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {plan.land_area.toLocaleString()} m² — {plan.shape}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.land_location?.lat?.toFixed(4)}, {plan.land_location?.lng?.toFixed(4)} · {plan.max_floors} floors max
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                    <StIcon className="w-3.5 h-3.5" />
                    {st.label}
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link to="/developer/analyze" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Analyze Land</p>
            <p className="text-xs text-muted-foreground">New feasibility study</p>
          </div>
        </Link>
        <Link to="/developer/plans" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
          <FileText className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">All Plans</p>
            <p className="text-xs text-muted-foreground">{plans.length} total</p>
          </div>
        </Link>
        <Link to="/developer/analyze" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
          <BarChart3 className="w-5 h-5 text-info" />
          <div>
            <p className="text-sm font-medium text-foreground">Reports</p>
            <p className="text-xs text-muted-foreground">Export & share</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
