import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const copy = {
  en: {
    tracked: "{{count}} opportunities tracked",
    analysisDone: "Portfolio analysis complete!",
    analysisFailed: "Failed",
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    diversification: "Diversification:",
    rebalancing: "Rebalancing Suggestions",
  },
  ar: {
    tracked: "{{count}} فرصة قيد المتابعة",
    analysisDone: "اكتمل تحليل المحفظة!",
    analysisFailed: "فشل التحليل",
    low: "مخاطر منخفضة",
    medium: "مخاطر متوسطة",
    high: "مخاطر مرتفعة",
    diversification: "التنويع:",
    rebalancing: "مقترحات إعادة التوازن",
  },
  ku: {
    tracked: "{{count}} دەرفەت بەدواداچوونیان بۆ دەکرێت",
    analysisDone: "شیکردنەوەی پۆرتفۆلیۆ تەواوبوو!",
    analysisFailed: "شیکردنەوە سەرکەوتوو نەبوو",
    low: "مەترسیی کەم",
    medium: "مەترسیی ناوەند",
    high: "مەترسیی بەرز",
    diversification: "جۆراوجۆری:",
    rebalancing: "پێشنیارەکانی ڕێکخستنەوە",
  },
} as const;

export default function PortfolioInsights() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);

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
      const apiLang = i18n.language?.split("-")[0] ?? "en";
      const { data, error } = await supabase.functions.invoke("opportunity-ai", {
        body: { type: "portfolio", language: apiLang, opportunity: opportunities },
      });
      if (error) throw error;
      setPortfolioAnalysis(data.analysis);
      toast.success(ui.analysisDone);
    } catch (e: any) {
      toast.error(e.message || ui.analysisFailed);
    }
    setAnalyzing(false);
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("portfolio.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{ui.tracked.replace("{{count}}", String(opportunities.length))}</p>
        </div>
        <Button onClick={runPortfolioAI} disabled={analyzing || opportunities.length === 0} className="bg-gradient-gold text-primary-foreground">
          {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {t("portfolio.aiPortfolioAnalysis")}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <DollarSign className="w-5 h-5 text-success mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">${(totalValue / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-muted-foreground">{t("portfolio.totalValue")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{avgScore}</p>
          <p className="text-xs text-muted-foreground">{t("portfolio.avgScore")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <Briefcase className="w-5 h-5 text-info mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{opportunities.length}</p>
          <p className="text-xs text-muted-foreground">{t("portfolio.totalOpportunities")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <PieChart className="w-5 h-5 text-warning mx-auto" />
          <p className="text-xl font-bold text-foreground mt-1">{Object.keys(cityMap).length}</p>
          <p className="text-xs text-muted-foreground">{t("portfolio.cities")}</p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />{t("portfolio.riskDistribution")}</h3>
        <div className="flex gap-3">
          {Object.entries(riskDist).map(([level, count]) => (
            <div key={level} className="flex-1 text-center p-3 rounded-lg bg-muted/30">
              <p className={`text-lg font-bold ${level === "low" ? "text-success" : level === "medium" ? "text-warning" : "text-destructive"}`}>{count}</p>
              <p className="text-xs text-muted-foreground">{level === "low" ? ui.low : level === "medium" ? ui.medium : ui.high}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{t("portfolio.geoExposure")}</h3>
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

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("portfolio.performanceRanking")}</h3>
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

      {portfolioAnalysis && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />{t("portfolio.aiPortfolioInsights")}</h3>
          {portfolioAnalysis.overallRecommendation && <p className="text-sm text-muted-foreground">{portfolioAnalysis.overallRecommendation}</p>}
          {portfolioAnalysis.diversificationScore != null && (
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{ui.diversification}</span><span className="font-bold text-foreground">{portfolioAnalysis.diversificationScore}/100</span></div>
          )}
          {portfolioAnalysis.rebalancingSuggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{ui.rebalancing}</p>
              <ul className="mt-1 space-y-1">{portfolioAnalysis.rebalancingSuggestions.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
