import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DbProperty } from "@/types/database";
import {
  Brain, TrendingUp, Shield, Users, Leaf, AlertTriangle, CheckCircle,
  XCircle, Loader2, ChevronDown, ChevronUp, Target, DollarSign, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { property: DbProperty; }

// ── Section accordion ─────────────────────────────────────────────────────────
function Section({ title, icon, id, expanded, toggle, children }: {
  title: string; icon: React.ReactNode; id: string;
  expanded: string | null; toggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div>
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">{icon} {title}</span>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function SwotBox({ label, items, icon }: { label: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3">
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">{icon} {label}</p>
      <ul className="space-y-1">
        {items?.map((item: string, i: number) => (
          <li key={i} className="text-xs text-muted-foreground">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Labels per language ───────────────────────────────────────────────────────
const SECTION_LABELS: Record<string, Record<string, string>> = {
  en: {
    investment_score: "Investment Score",
    swot: "SWOT Analysis",
    financials: "Financial Metrics",
    risk: "Risk Assessment",
    demographics: "Area Demographics",
    market: "Market Intelligence",
    esg: "ESG Score",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    opportunities: "Opportunities",
    threats: "Threats",
    rerun: "Re-run Analysis",
    run: "Run AI Analysis (Pro+)",
    analyzing: "Analyzing…",
    desc: "Investment scoring, SWOT, financials, risk & more",
    title: "AI Property Analysis",
    intro: "Get a comprehensive AI-powered analysis including investment scoring, SWOT analysis, financial metrics, market intelligence, risk assessment, demographics, and ESG score.",
  },
  ar: {
    investment_score: "درجة الاستثمار",
    swot: "تحليل SWOT",
    financials: "المقاييس المالية",
    risk: "تقييم المخاطر",
    demographics: "ديموغرافيا المنطقة",
    market: "ذكاء السوق",
    esg: "درجة ESG",
    strengths: "نقاط القوة",
    weaknesses: "نقاط الضعف",
    opportunities: "الفرص",
    threats: "التهديدات",
    rerun: "إعادة التحليل",
    run: "تشغيل تحليل الذكاء الاصطناعي",
    analyzing: "جارٍ التحليل…",
    desc: "تقييم الاستثمار، SWOT، المالية، المخاطر والمزيد",
    title: "تحليل العقار بالذكاء الاصطناعي",
    intro: "احصل على تحليل شامل يشمل تقييم الاستثمار وتحليل SWOT والمقاييس المالية وذكاء السوق وتقييم المخاطر والديموغرافيا ودرجة ESG.",
  },
  ku: {
    investment_score: "نمرەی وەبەرهێنان",
    swot: "شیکاری SWOT",
    financials: "پێوەرە داراییەکان",
    risk: "هەڵسەنگاندنی مەترسی",
    demographics: "دیموگرافیای ناوچە",
    market: "زیرەکی بازاڕ",
    esg: "نمرەی ESG",
    strengths: "خاڵە بەهێزەکان",
    weaknesses: "خاڵە لاوازەکان",
    opportunities: "دەرفەتەکان",
    threats: "مەترسییەکان",
    rerun: "دووبارە شیکردنەوە",
    run: "شیکاری AI (پرۆ+)",
    analyzing: "شیکردنەوە…",
    desc: "نمرەی وەبەرهێنان، SWOT، دارایی، مەترسی و زیاتر",
    title: "شیکاری خانووبەرەی AI",
    intro: "شیکارییەکی گشتگیر وەربگرە کە نمرەی وەبەرهێنان، شیکاری SWOT، پێوەرە داراییەکان، زیرەکی بازاڕ، هەڵسەنگاندنی مەترسی، دیموگرافیا و نمرەی ESG لەخۆ دەگرێت.",
  },
};

function getLabels(lang: string) {
  return SECTION_LABELS[lang] ?? SECTION_LABELS.en;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PropertyAIAnalysis({ property }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "en"; // normalise e.g. "en-US" → "en"
  const L = getLabels(lang);

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: {
          type: "full_analysis",
          language: lang,                          // ← pass current language
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
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
      } else {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  // ── Pre-run state ──────────────────────────────────────────────────────────
  if (!analysis) {
    return (
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{L.title}</h3>
            <p className="text-xs text-muted-foreground">{L.desc}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{L.intro}</p>
        <Button onClick={runAnalysis} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
          {loading
            ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{L.analyzing}</>
            : <><Brain className="w-4 h-4 me-2" />{L.run}</>}
        </Button>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  const recommendation = analysis.recommendation;
  const recColor =
    recommendation === "BUY"  || recommendation === "شراء" || recommendation === "بکڕە"
      ? "text-success" :
    recommendation === "AVOID"|| recommendation === "تجنب"  || recommendation === "دووری لێ بگرەوە"
      ? "text-destructive" : "text-warning";

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{L.title}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${recColor} bg-card border border-border`}>
            {recommendation}
          </span>
        </div>
        {analysis.summary && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{analysis.summary}</p>
        )}
      </div>

      <div className="divide-y divide-border">

        {/* Investment Score */}
        {analysis.investmentScore && (
          <Section title={L.investment_score} icon={<Target className="w-4 h-4" />} id="score" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(analysis.investmentScore).map(([k, v]) => (
                <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">{v as number}</p>
                  <p className="text-xs text-muted-foreground capitalize">{k}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* SWOT */}
        {analysis.swot && (
          <Section title={L.swot} icon={<BarChart3 className="w-4 h-4" />} id="swot" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-2 gap-3">
              <SwotBox label={L.strengths}    items={analysis.swot.strengths}    icon={<CheckCircle className="w-3.5 h-3.5 text-success" />} />
              <SwotBox label={L.weaknesses}   items={analysis.swot.weaknesses}   icon={<XCircle className="w-3.5 h-3.5 text-destructive" />} />
              <SwotBox label={L.opportunities}items={analysis.swot.opportunities}icon={<TrendingUp className="w-3.5 h-3.5 text-primary" />} />
              <SwotBox label={L.threats}      items={analysis.swot.threats}      icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} />
            </div>
          </Section>
        )}

        {/* Financials */}
        {analysis.financials && (
          <Section title={L.financials} icon={<DollarSign className="w-4 h-4" />} id="fin" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.financials).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-medium text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Risk */}
        {analysis.risk && (
          <Section title={L.risk} icon={<Shield className="w-4 h-4" />} id="risk" expanded={expanded} toggle={toggle}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-foreground">{analysis.risk.overallScore}/100</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                analysis.risk.level === "low"  ? "bg-success/10 text-success" :
                analysis.risk.level === "high" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"}`}>
                {analysis.risk.level?.toUpperCase()}
              </span>
            </div>
            {analysis.risk.factors?.map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-sm py-1 border-t border-border/50">
                <span className="text-muted-foreground">{f.name}</span>
                <span className="text-foreground">{f.score}/100</span>
              </div>
            ))}
          </Section>
        )}

        {/* Demographics */}
        {analysis.demographics && (
          <Section title={L.demographics} icon={<Users className="w-4 h-4" />} id="demo" expanded={expanded} toggle={toggle}>
            {Object.entries(analysis.demographics).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="font-medium text-foreground">{String(v)}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Market Insights */}
        {analysis.marketInsights && (
          <Section title={L.market} icon={<TrendingUp className="w-4 h-4" />} id="market" expanded={expanded} toggle={toggle}>
            {Object.entries(analysis.marketInsights).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="font-medium text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
              </div>
            ))}
          </Section>
        )}

        {/* ESG */}
        {analysis.esg && (
          <Section title={L.esg} icon={<Leaf className="w-4 h-4" />} id="esg" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {["score","environmental","social","governance"].map(k => (
                <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">{analysis.esg[k]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{k === "score" ? "Overall" : k}</p>
                </div>
              ))}
            </div>
            {analysis.esg.notes && <p className="text-xs text-muted-foreground mt-1">{analysis.esg.notes}</p>}
          </Section>
        )}
      </div>

      {/* Re-run */}
      <div className="p-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-3 h-3 me-1 animate-spin" /> : null}
          {L.rerun}
        </Button>
      </div>
    </div>
  );
}
