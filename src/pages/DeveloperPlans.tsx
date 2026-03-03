import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Plus, Clock, CheckCircle2, AlertCircle, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

export default function DeveloperPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase
        .from("project_plans" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);
      setPlans((data as PlanRow[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const handleDelete = async (id: string) => {
    await (supabase.from("project_plans" as any).delete().eq("id", id) as any);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const statusIcon: Record<string, any> = {
    draft: FileText,
    processing: Clock,
    complete: CheckCircle2,
    error: AlertCircle,
  };
  const statusColor: Record<string, string> = {
    draft: "text-muted-foreground",
    processing: "text-warning",
    complete: "text-success",
    error: "text-destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">All Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Your feasibility studies and AI reports.</p>
        </div>
        <Link to="/developer/analyze">
          <Button className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No plans yet</p>
          <Link to="/developer/analyze"><Button variant="outline" className="mt-4"><Plus className="w-4 h-4 mr-2" /> Create First Plan</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const StIcon = statusIcon[plan.status] || FileText;
            return (
              <div key={plan.id} className="flex items-center gap-4 rounded-xl bg-card border border-border p-4">
                <Link to={`/developer/plan/${plan.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {plan.land_area.toLocaleString()} m² — {plan.shape}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.land_location?.lat?.toFixed(4)}, {plan.land_location?.lng?.toFixed(4)} · {plan.max_floors} floors
                    </p>
                  </div>
                  <Badge variant="outline" className={`${statusColor[plan.status]} border-0 text-xs flex items-center gap-1`}>
                    <StIcon className="w-3 h-3" /> {plan.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground hidden sm:block">{new Date(plan.created_at).toLocaleDateString()}</p>
                </Link>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
