import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, MapPin, Building2, DollarSign, Megaphone, TrendingUp,
  CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Plan = {
  id: string;
  land_area: number;
  land_location: { lat: number; lng: number };
  shape: string;
  max_floors: number;
  restrictions: string[];
  status: string;
  result: any;
  created_at: string;
};

export default function PlanResults() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    if (!id) return;
    const { data, error } = await (supabase
      .from("project_plans" as any)
      .select("*")
      .eq("id", id)
      .single() as any);
    if (error) {
      toast({ title: "Error", description: "Plan not found", variant: "destructive" });
    } else {
      setPlan(data as Plan);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlan();
    // Poll if processing
    const interval = setInterval(async () => {
      if (plan?.status === "processing") {
        const { data } = await (supabase
          .from("project_plans" as any)
          .select("status, result")
          .eq("id", id)
          .single() as any);
        if (data && data.status !== "processing") {
          setPlan((prev) => prev ? { ...prev, ...data } : prev);
          clearInterval(interval);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, plan?.status]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-medium">Plan not found</p>
        <Link to="/developer"><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>
      </div>
    );
  }

  if (plan.status === "processing") {
    return (
      <div className="text-center py-16 space-y-4">
        <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
        <p className="text-foreground font-medium text-lg">AI is analyzing your land…</p>
        <p className="text-sm text-muted-foreground">This usually takes 15–30 seconds. The page will update automatically.</p>
      </div>
    );
  }

  const r = plan.result || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/developer">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Feasibility Report
          </h1>
          <p className="text-sm text-muted-foreground">
            {plan.land_area.toLocaleString()} m² · {plan.shape} · {plan.land_location?.lat?.toFixed(4)}, {plan.land_location?.lng?.toFixed(4)}
          </p>
        </div>
        <Badge variant={plan.status === "complete" ? "default" : "destructive"} className="flex items-center gap-1">
          {plan.status === "complete" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {plan.status}
        </Badge>
      </div>

      {plan.status === "error" && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          Analysis failed. Please try again or adjust your inputs.
        </div>
      )}

      {plan.status === "complete" && r && (
        <Tabs defaultValue="use" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="use" className="text-xs"><MapPin className="w-3 h-3 mr-1" /> Use</TabsTrigger>
            <TabsTrigger value="design" className="text-xs"><Building2 className="w-3 h-3 mr-1" /> Design</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs"><DollarSign className="w-3 h-3 mr-1" /> Pricing</TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs"><Megaphone className="w-3 h-3 mr-1" /> Marketing</TabsTrigger>
            <TabsTrigger value="feasibility" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" /> Feasibility</TabsTrigger>
          </TabsList>

          {/* Land Use Tab */}
          <TabsContent value="use" className="space-y-4 mt-4">
            <div className="rounded-xl bg-card border border-border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">{r.land_use?.recommendation || "N/A"}</h3>
                {r.land_use?.confidence != null && (
                  <Badge variant="secondary" className="text-xs">
                    {(r.land_use.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.land_use?.rationale}</p>
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-4 mt-4">
            <div className="rounded-xl bg-card border border-border p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Floors</p>
                  <p className="text-xl font-bold text-foreground">{r.design?.floors}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Units per Floor</p>
                  <p className="text-xl font-bold text-foreground">{r.design?.units_per_floor}</p>
                </div>
              </div>

              {r.design?.unit_mix && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Unit Mix</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(r.design.unit_mix).map(([size, count]) => (
                      <Badge key={size} variant="outline" className="text-xs">
                        {size}: {String(count)} units
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {r.design?.amenities && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {r.design.amenities.map((a: string) => (
                      <Badge key={a} className="text-xs bg-primary/10 text-primary border-0">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="rounded-xl bg-card border border-border p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Floor</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Price per Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.pricing?.by_floor?.map((f: any) => (
                      <tr key={f.floor} className="border-b border-border/50">
                        <td className="py-2 text-foreground">Floor {f.floor}</td>
                        <td className="py-2 text-right text-foreground font-medium">
                          ${f.price_per_unit?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-4 mt-4">
            <div className="rounded-xl bg-card border border-border p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Channels</p>
                <div className="flex flex-wrap gap-2">
                  {r.marketing?.channels?.map((c: string) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="text-lg font-bold text-foreground">{r.marketing?.timeline_months} months</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Audience</p>
                  <p className="text-sm text-foreground">{r.marketing?.target_audience}</p>
                </div>
              </div>
              {r.marketing?.offers && (
                <div>
                  <p className="text-xs text-muted-foreground">Suggested Offers</p>
                  <p className="text-sm text-foreground mt-1">{r.marketing.offers}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Feasibility Tab */}
          <TabsContent value="feasibility" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Cost", value: `$${(r.financials?.total_cost || 0).toLocaleString()}`, color: "text-destructive" },
                { label: "Projected Revenue", value: `$${(r.financials?.projected_revenue || 0).toLocaleString()}`, color: "text-success" },
                { label: "ROI", value: `${r.financials?.roi_pct || 0}%`, color: "text-warning" },
                { label: "Payback", value: `${r.financials?.payback_years || 0} yrs`, color: "text-info" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Breakeven Units</p>
                <p className="text-sm font-bold text-foreground">{r.financials?.breakeven_units}</p>
              </div>
              {r.financials?.risk_range && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">ROI Risk Range</p>
                  <p className="text-sm font-bold text-foreground">
                    {r.financials.risk_range[0]}% – {r.financials.risk_range[1]}%
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
