import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  GitCompareArrows, X, Plus, MapPin, Loader2, Brain, TrendingUp,
  Shield, Star, BarChart3, Bed, Bath, Maximize, DollarSign,
  CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import type { DbProperty } from "@/types/database";
import property1 from "@/assets/property-1.jpg";
import { useUserRoles, getBestHomeRoute } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIScores {
  recommendation?: string;
  investmentScore?: Record<string, number>;
  risk?: { overallScore: number; level: string };
  financials?: Record<string, number | string>;
}

const REC_COLOR: Record<string, string> = {
  BUY: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  HOLD: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  SELL: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
  AVOID: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
};

const RISK_COLOR: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-red-600",
};

function ScoreBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{value}</span>
    </div>
  );
}

export default function CompareListings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: allProperties = [], isLoading } = useProperties();
  const { data: userRoles = [] } = useUserRoles();
  const rolePrefix = getBestHomeRoute(userRoles).replace("/", "");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [aiScores, setAiScores] = useState<Record<string, AIScores>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  const selected = selectedIds.length > 0 ? selectedIds : allProperties.slice(0, 2).map(p => p.id);
  const selectedProperties = selected.map(id => allProperties.find(p => p.id === id)).filter(Boolean) as DbProperty[];
  const available = allProperties.filter(p => !selected.includes(p.id));

  const addProperty = (id: string) => {
    if (selected.length < 4) setSelectedIds([...selected, id]);
  };
  const removeProperty = (id: string) => {
    setSelectedIds(selected.filter(s => s !== id));
  };

  const fetchAI = async (property: DbProperty) => {
    if (aiScores[property.id] || aiLoading[property.id]) return;
    setAiLoading(prev => ({ ...prev, [property.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: {
          type: "full_analysis",
          language: "en",
          property: {
            title: property.title,
            price: property.price,
            city: property.city,
            district: property.district,
            type: property.property_type ?? property.type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            features: property.features ?? [],
            description: property.description ?? "",
          },
        },
      });
      if (!error && !data?.error) {
        setAiScores(prev => ({ ...prev, [property.id]: data.analysis }));
      } else {
        toast({ title: "AI Error", description: data?.error || error?.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(prev => ({ ...prev, [property.id]: false }));
    }
  };

  const fetchAllAI = () => {
    selectedProperties.forEach(fetchAI);
  };

  const compareFields: {
    label: string;
    render: (p: DbProperty) => React.ReactNode;
    highlight?: (vals: (DbProperty)[]) => string[];
  }[] = [
    {
      label: "Price (USD)",
      render: p => <span className="font-bold text-foreground">${p.price.toLocaleString()}</span>,
      highlight: props => {
        const min = Math.min(...props.map(p => p.price));
        return props.map(p => p.price === min ? p.id : "");
      },
    },
    {
      label: "Area (m²)",
      render: p => (
        <span className="flex items-center gap-1">
          <Maximize className="w-3.5 h-3.5 text-muted-foreground" /> {p.area}
        </span>
      ),
    },
    {
      label: "Beds / Baths",
      render: p => (
        <span className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-muted-foreground" />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-muted-foreground" />{p.bathrooms}</span>
        </span>
      ),
    },
    {
      label: "AqarAI Score",
      render: p => (
        <div className="w-full">
          <ScoreBar
            value={p.terra_score ?? 0}
            color={p.terra_score >= 80 ? "bg-emerald-500" : p.terra_score >= 60 ? "bg-amber-500" : "bg-red-500"}
          />
        </div>
      ),
      highlight: props => {
        const max = Math.max(...props.map(p => p.terra_score ?? 0));
        return props.map(p => (p.terra_score ?? 0) === max ? p.id : "");
      },
    },
    {
      label: "AI Valuation",
      render: p => p.ai_valuation
        ? <span className="font-semibold">${p.ai_valuation.toLocaleString()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      label: "Verified",
      render: p => p.verified
        ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Yes</span>
        : <span className="flex items-center gap-1 text-muted-foreground text-xs"><XCircle className="w-3.5 h-3.5" /> No</span>,
    },
    {
      label: "Status",
      render: p => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          p.status === "active" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" :
          p.status === "sold" ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400" :
          "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
        }`}>
          {p.status}
        </span>
      ),
    },
  ];

  // AI-powered rows
  const aiFields: {
    label: string;
    icon: React.ReactNode;
    render: (p: DbProperty, scores: AIScores | undefined, loading: boolean) => React.ReactNode;
  }[] = [
    {
      label: "AI Recommendation",
      icon: <Brain className="w-3.5 h-3.5" />,
      render: (p, scores, loading) => {
        if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        if (!scores) return <span className="text-xs text-muted-foreground">—</span>;
        const rec = scores.recommendation?.toUpperCase() ?? "";
        return (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${REC_COLOR[rec] ?? "text-foreground bg-secondary border-border"}`}>
            {rec}
          </span>
        );
      },
    },
    {
      label: "Overall Investment",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      render: (p, scores, loading) => {
        if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        if (!scores?.investmentScore) return <span className="text-xs text-muted-foreground">—</span>;
        const vals = Object.values(scores.investmentScore);
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        return <ScoreBar value={avg} color="bg-primary" />;
      },
    },
    {
      label: "Risk Level",
      icon: <Shield className="w-3.5 h-3.5" />,
      render: (p, scores, loading) => {
        if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        if (!scores?.risk) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${RISK_COLOR[scores.risk.level] ?? "text-foreground"}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {scores.risk.level?.toUpperCase()} ({scores.risk.overallScore}/100)
          </span>
        );
      },
    },
    {
      label: "Market Score",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      render: (p, scores, loading) => {
        if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        if (!scores?.investmentScore) return <span className="text-xs text-muted-foreground">—</span>;
        const val = (scores.investmentScore as any).marketAppeal ?? (scores.investmentScore as any).market ?? 0;
        return val ? <ScoreBar value={val} color="bg-indigo-500" /> : <span className="text-xs text-muted-foreground">—</span>;
      },
    },
    {
      label: "ROI Estimate",
      icon: <DollarSign className="w-3.5 h-3.5" />,
      render: (p, scores, loading) => {
        if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        const fin = scores?.financials;
        if (!fin) return <span className="text-xs text-muted-foreground">—</span>;
        const roi = (fin as any).expectedROI ?? (fin as any).roi ?? (fin as any).annualROI;
        return roi != null
          ? <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{roi}%</span>
          : <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  const hasAnyAI = selectedProperties.some(p => aiScores[p.id]);
  const allAILoading = selectedProperties.every(p => aiLoading[p.id]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const colTemplate = `180px repeat(${selectedProperties.length}, 1fr)`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6 text-primary" /> {t("compare.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("compare.subtitle")}</p>
        </div>
        {selectedProperties.length >= 2 && (
          <button
            onClick={fetchAllAI}
            disabled={allAILoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
          >
            {allAILoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
              : <><Brain className="w-4 h-4" /> Run AI Analysis</>
            }
          </button>
        )}
      </div>

      {/* Property picker */}
      {selected.length < 4 && available.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm text-muted-foreground">{t("compare.add")}</span>
          {available.slice(0, 8).map(p => (
            <button
              key={p.id}
              onClick={() => addProperty(p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              <Plus className="w-3 h-3" /> {p.title}
            </button>
          ))}
        </div>
      )}

      {selectedProperties.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-1">

            {/* Property cards header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: colTemplate }}>
              <div />
              {selectedProperties.map(p => (
                <div key={p.id} className="rounded-2xl bg-card border border-border p-4 relative group animate-fade-in hover:border-primary/30 transition-colors">
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <img
                    src={p.property_images?.[0]?.url || property1}
                    alt={p.title}
                    className="w-full h-28 object-cover rounded-xl mb-3 border border-border"
                  />
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{p.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" /> {p.city}, {p.district}
                  </p>
                  <button
                    onClick={() => navigate(`/${rolePrefix}/analysis/${p.id}`)}
                    className="mt-3 w-full text-xs py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <Brain className="w-3 h-3" /> View Full Analysis
                  </button>
                </div>
              ))}
            </div>

            {/* Section divider: Basic Info */}
            <div className="grid gap-4 pt-3" style={{ gridTemplateColumns: colTemplate }}>
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Basic Info</div>
              {selectedProperties.map(p => <div key={p.id} />)}
            </div>

            {/* Basic compare rows */}
            {compareFields.map((field, i) => {
              const bestIds = field.highlight ? field.highlight(selectedProperties).filter(Boolean) : [];
              return (
                <div key={field.label} className="grid gap-4" style={{ gridTemplateColumns: colTemplate }}>
                  <div className={`flex items-center px-3 py-2.5 text-xs font-medium text-muted-foreground ${i % 2 === 0 ? "bg-secondary/40 rounded-l-xl" : ""}`}>
                    {field.label}
                  </div>
                  {selectedProperties.map(p => (
                    <div
                      key={p.id}
                      className={`flex items-center px-3 py-2.5 text-sm ${i % 2 === 0 ? "bg-secondary/40" : ""} ${
                        bestIds.includes(p.id) ? "ring-1 ring-inset ring-emerald-400/40 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl" : ""
                      }`}
                    >
                      {field.render(p)}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Section divider: AI Analysis */}
            <div className="grid gap-4 pt-5" style={{ gridTemplateColumns: colTemplate }}>
              <div className="px-3 py-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Brain className="w-3.5 h-3.5" /> AI Analysis
              </div>
              {selectedProperties.map(p => (
                <div key={p.id} className="px-3 py-2">
                  {!aiScores[p.id] && !aiLoading[p.id] && (
                    <button
                      onClick={() => fetchAI(p)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      <Brain className="w-3 h-3" /> Analyze
                    </button>
                  )}
                  {aiLoading[p.id] && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</span>}
                  {aiScores[p.id] && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Analysis ready</span>}
                </div>
              ))}
            </div>

            {/* AI metric rows */}
            {aiFields.map((field, i) => (
              <div key={field.label} className="grid gap-4" style={{ gridTemplateColumns: colTemplate }}>
                <div className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-muted-foreground ${i % 2 === 0 ? "bg-secondary/40 rounded-l-xl" : ""}`}>
                  {field.icon} {field.label}
                </div>
                {selectedProperties.map(p => (
                  <div key={p.id} className={`flex items-center px-3 py-2.5 ${i % 2 === 0 ? "bg-secondary/40" : ""}`}>
                    {field.render(p, aiScores[p.id], !!aiLoading[p.id])}
                  </div>
                ))}
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}
