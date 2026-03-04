import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Briefcase, DollarSign, TrendingUp, MapPin, AlertTriangle,
  Sparkles, Loader2, PieChart
} from "lucide-react";

export default function PortfolioInsights() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.from("opportunities" as any).select("*").order("investment_score", { ascending: false }) as any);
      setOpportunities(data || []);
      setLoading(false);
    })();
  }, [user]);

  const totalValue = opportunities.reduce((s, o) => s + (o.entry_price || 0), 0);
  const avgScore = opportunities.length ? Math.round(opportunities.reduce((s, o) => s + (o.investment_score || 0), 0) / opportunities.length) : 0;
  const riskDist = { low: 0, medium: 0, high: 0 };
  const cityMap: Record<string, number> = {};
  opportunities.forEach((o) => {
    riskDist[o.risk_level as keyof typeof riskDist]++;
    if (o.city) cityMap[o.city] = (cityMap[o.city] || 0) + o.entry_price;
  });

  const runPortfolioAI = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-ai", {
        body: { type: "portfolio", opportunity: opportunities },
      });
      if (error) throw error;
      setPortfolioAnalysis(data.analysis);
      toast.success("Portfolio analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setAnalyzing(false);
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Portfolio Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">{opportunities.length} opportunities tracked</p>
        </div>
        <Button onClick={runPortfolioAI} disabled={analyzing || opportunities.length === 0} className="bg-gradient-gold text-primary-foreground">
          {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          AI Portfolio Analysis
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <DollarSign className="w-5 h-5 text-success mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">${(totalValue / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Investment Score</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <Briefcase className="w-5 h-5 text-info mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{opportunities.length}</p>
          <p className="text-xs text-muted-foreground">Total Opportunities</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <PieChart className="w-5 h-5 text-warning mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{Object.keys(cityMap).length}</p>
          <p className="text-xs text-muted-foreground">Cities</p>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Risk Distribution</h3>
        <div className="flex gap-3">
          {Object.entries(riskDist).map(([level, count]) => (
            <div key={level} className="flex-1 text-center p-3 rounded-lg bg-muted/30">
              <p className={`text-lg font-bold ${level === "low" ? "text-success" : level === "medium" ? "text-warning" : "text-destructive"}`}>{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{level} Risk</p>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Exposure */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Geographic Exposure</h3>
        <div className="space-y-2">
          {Object.entries(cityMap).sort(([, a], [, b]) => b - a).map(([city, value]) => (
            <div key={city} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{city}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(value / totalValue) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">${(value / 1e3).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Ranking */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Performance Ranking</h3>
        <div className="space-y-2">
          {opportunities.slice(0, 10).map((o, i) => (
            <div key={o.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-muted-foreground font-medium">#{i + 1}</span>
              <span className="flex-1 text-foreground truncate">{o.title}</span>
              <Badge variant="outline" className="text-xs">{o.city}</Badge>
              <span className={`font-bold ${o.investment_score >= 70 ? "text-success" : o.investment_score >= 40 ? "text-warning" : "text-destructive"}`}>{o.investment_score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Portfolio Analysis */}
      {portfolioAnalysis && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Portfolio Insights</h3>
          {portfolioAnalysis.overallRecommendation && <p className="text-sm text-muted-foreground">{portfolioAnalysis.overallRecommendation}</p>}
          {portfolioAnalysis.diversificationScore != null && (
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Diversification:</span><span className="font-bold text-foreground">{portfolioAnalysis.diversificationScore}/100</span></div>
          )}
          {portfolioAnalysis.rebalancingSuggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Rebalancing Suggestions</p>
              <ul className="mt-1 space-y-1">{portfolioAnalysis.rebalancingSuggestions.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
