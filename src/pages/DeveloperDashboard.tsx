import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin, Plus, BarChart3, FileText, TrendingUp,
  Building2, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatSkeleton, ListSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";

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

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DeveloperDashboard() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl font-display font-bold text-foreground">{t("developer.dashboardTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("developer.dashboardSubtitle")}</p>
        </div>
        <Link to="/developer/analyze">
          <Button className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> {t("developer.newAnalysis")}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t("developer.totalPlans"), value: plans.length, icon: FileText, color: "text-primary" },
            { title: t("developer.completed"), value: completedPlans.length, icon: CheckCircle2, color: "text-success" },
            { title: t("developer.avgROI"), value: `${avgROI}%`, icon: TrendingUp, color: "text-warning" },
            { title: t("developer.processing"), value: plans.filter((p) => p.status === "processing").length, icon: Clock, color: "text-info" },
          ].map((stat) => (
            <motion.div key={stat.title} variants={item}>
              <div className="rounded-xl bg-card border border-border p-4 hover:shadow-md transition-shadow">
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
            </motion.div>
          ))}
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> {t("developer.recentPlans")}
          </h2>
          <Link to="/developer/plans" className="text-xs text-primary hover:underline">{t("common.viewAll")} →</Link>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("developer.noPlansYet")}
            description={t("developer.noPlansDesc")}
            action={
              <Link to="/developer/analyze">
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> {t("developer.createFirstPlan")}</Button>
              </Link>
            }
          />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {plans.map((plan) => {
              const st = statusConfig[plan.status] || statusConfig.draft;
              const StIcon = st.icon;
              return (
                <motion.div key={plan.id} variants={item}>
                  <Link
                    to={`/developer/plan/${plan.id}`}
                    className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all"
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
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: "/developer/analyze", icon: MapPin, color: "text-primary", title: t("developer.analyzeLand"), sub: t("developer.newFeasibility") },
          { to: "/developer/plans", icon: FileText, color: "text-success", title: t("developer.allPlans"), sub: `${plans.length} total` },
          { to: "/developer/analyze", icon: BarChart3, color: "text-info", title: t("developer.reports"), sub: t("developer.exportShare") },
        ].map((link) => (
          <motion.div key={link.to + link.title} variants={item}>
            <Link to={link.to} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all">
              <link.icon className={`w-5 h-5 ${link.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
