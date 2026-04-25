import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DbProperty } from "@/types/database";
import {
  Brain, TrendingUp, Shield, Users, Leaf, AlertTriangle, CheckCircle,
  XCircle, Loader2, ChevronDown, ChevronUp, Target, DollarSign, BarChart3, Download,
} from "lucide-react";

// Localized labels for fixed enum tokens returned by the AI
const REC_LABELS: Record<string, Record<string, string>> = {
  en: { BUY: "BUY", HOLD: "HOLD", SELL: "SELL", AVOID: "AVOID" },
  ar: { BUY: "شراء", HOLD: "احتفاظ", SELL: "بيع", AVOID: "تجنّب" },
  ku: { BUY: "بکڕە", HOLD: "هەڵگرە", SELL: "بیفرۆشە", AVOID: "دووری لێبگرەوە" },
};
const LEVEL_LABELS: Record<string, Record<string, string>> = {
  en: { low: "LOW", medium: "MEDIUM", high: "HIGH" },
  ar: { low: "منخفض", medium: "متوسط", high: "مرتفع" },
  ku: { low: "نزم", medium: "مامناوەند", high: "بەرز" },
};
import { Button } from "@/components/ui/button";

interface Props { property: DbProperty; }

function Section({ title, icon, id, expanded, toggle, children }: {
  title: string; icon: React.ReactNode; id: string;
  expanded: string | null; toggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div>
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">{icon} {title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
          <li key={i} className="text-xs text-muted-foreground" dir="auto">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PropertyAIAnalysis({ property }: Props) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();
  const analysisLangRef = useRef<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: {
          type: "full_analysis",
          language: lang,
          property: {
            title:       property.title,
            price:       property.price,
            city:        property.city,
            district:    property.district,
            type:        property.property_type ?? property.type,
            bedrooms:    property.bedrooms,
            bathrooms:   property.bathrooms,
            area:        property.area,
            features:    property.features ?? [],
            description: property.description ?? "",
          },
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t("common.error"), description: data.error, variant: "destructive" });
      } else {
        setAnalysis(data.analysis);
        analysisLangRef.current = lang;
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Auto re-run when the user switches app language so the cached AI output
  // is regenerated in the newly selected language for the same property.
  useEffect(() => {
    if (analysis && analysisLangRef.current && analysisLangRef.current !== lang) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Reset cached analysis when the underlying property changes
  useEffect(() => {
    setAnalysis(null);
    analysisLangRef.current = null;
  }, [property.id]);

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const downloadReport = () => {
    if (!analysis) return;
    const recLabel2 = REC_LABELS[lang]?.[analysis.recommendation?.toUpperCase()] ?? analysis.recommendation ?? "";
    const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" || lang === "ku" ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Property Analysis — ${property.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #fff; color: #111; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 0.85rem; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 999px; font-weight: 700; font-size: 0.9rem; border: 1.5px solid; }
    .badge-buy { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
    .badge-avoid { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .badge-other { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .summary { background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 0.95rem; line-height: 1.6; color: #334155; }
    .section { margin: 24px 0; }
    .section-title { font-size: 1rem; font-weight: 600; color: #6366f1; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }
    .card { background: #f8fafc; border-radius: 10px; padding: 14px; border: 1px solid #e2e8f0; }
    .card-label { font-size: 0.72rem; color: #94a3b8; margin-top: 4px; }
    .card-value { font-size: 1.3rem; font-weight: 700; color: #111; }
    .swot-box { background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; }
    .swot-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .swot-box ul { padding-left: 14px; }
    .swot-box li { font-size: 0.82rem; color: #475569; line-height: 1.5; }
    .kv-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; }
    .kv-label { color: #64748b; }
    .kv-value { font-weight: 600; }
    .risk-level { display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .risk-low { background: #d1fae5; color: #065f46; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-high { background: #fee2e2; color: #991b1b; }
    .meta { color: #94a3b8; font-size: 0.78rem; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <h1>${property.title}</h1>
      <p class="subtitle">📍 ${property.district}, ${property.city} · ${property.area}m² · $${property.price.toLocaleString()}</p>
    </div>
    <span class="badge ${analysis.recommendation?.toUpperCase() === 'BUY' ? 'badge-buy' : analysis.recommendation?.toUpperCase() === 'AVOID' ? 'badge-avoid' : 'badge-other'}">${recLabel2}</span>
  </div>

  ${analysis.summary ? `<div class="summary">${analysis.summary}</div>` : ""}

  ${analysis.investmentScore ? `
  <div class="section">
    <div class="section-title">📊 Investment Score</div>
    <div class="grid-3">
      ${Object.entries(analysis.investmentScore).map(([k, v]) => `
        <div class="card">
          <div class="card-value">${v}</div>
          <div class="card-label">${k.replace(/([A-Z])/g, " $1")}</div>
        </div>
      `).join("")}
    </div>
  </div>` : ""}

  ${analysis.swot ? `
  <div class="section">
    <div class="section-title">🔲 SWOT Analysis</div>
    <div class="grid-2">
      <div class="swot-box"><div class="swot-title" style="color:#065f46">✅ Strengths</div><ul>${(analysis.swot.strengths || []).map((s: string) => `<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-box"><div class="swot-title" style="color:#991b1b">❌ Weaknesses</div><ul>${(analysis.swot.weaknesses || []).map((s: string) => `<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-box"><div class="swot-title" style="color:#1d4ed8">📈 Opportunities</div><ul>${(analysis.swot.opportunities || []).map((s: string) => `<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-box"><div class="swot-title" style="color:#b45309">⚠️ Threats</div><ul>${(analysis.swot.threats || []).map((s: string) => `<li>${s}</li>`).join("")}</ul></div>
    </div>
  </div>` : ""}

  ${analysis.financials ? `
  <div class="section">
    <div class="section-title">💰 Financials</div>
    ${Object.entries(analysis.financials).map(([k, v]) => `
      <div class="kv-row">
        <span class="kv-label">${k.replace(/([A-Z])/g, " $1")}</span>
        <span class="kv-value">${typeof v === "number" ? v.toLocaleString() : v}</span>
      </div>`).join("")}
  </div>` : ""}

  ${analysis.risk ? `
  <div class="section">
    <div class="section-title">🛡️ Risk Assessment</div>
    <p style="margin-bottom:10px">Overall: <strong>${analysis.risk.overallScore}/100</strong>
      <span class="risk-level risk-${analysis.risk.level}">${analysis.risk.level?.toUpperCase()}</span>
    </p>
    ${(analysis.risk.factors || []).map((f: any) => `
      <div class="kv-row"><span class="kv-label">${f.name}</span><span class="kv-value">${f.score}/100</span></div>`).join("")}
  </div>` : ""}

  ${analysis.marketInsights ? `
  <div class="section">
    <div class="section-title">📈 Market Insights</div>
    ${Object.entries(analysis.marketInsights).map(([k, v]) => `
      <div class="kv-row">
        <span class="kv-label">${k.replace(/([A-Z])/g, " $1")}</span>
        <span class="kv-value">${typeof v === "number" ? v.toLocaleString() : v}</span>
      </div>`).join("")}
  </div>` : ""}

  ${analysis.esg ? `
  <div class="section">
    <div class="section-title">🌿 ESG Score</div>
    <div class="grid-4">
      ${["score","environmental","social","governance"].map(k => `
        <div class="card">
          <div class="card-value">${analysis.esg[k]}</div>
          <div class="card-label">${k}</div>
        </div>`).join("")}
    </div>
    ${analysis.esg.notes ? `<p style="font-size:0.82rem;color:#64748b;margin-top:10px">${analysis.esg.notes}</p>` : ""}
  </div>` : ""}

  <div class="meta">Generated by AqarAI · ${new Date().toLocaleDateString()} · AI analysis is for informational purposes only and does not constitute financial or legal advice.</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`AqarAI-Analysis-\${property.title.replace(/\s+/g, "-")}.html\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Pre-run ──────────────────────────────────────────────────────────────
  if (!analysis) {
    return (
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("aiAnalysis.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("aiAnalysis.desc")}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("aiAnalysis.intro")}</p>
        <Button onClick={runAnalysis} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
          {loading
            ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t("aiAnalysis.analyzing")}</>
            : <><Brain className="w-4 h-4 me-2" />{t("aiAnalysis.run")}</>}
        </Button>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────
  const recommendation: string = analysis.recommendation ?? "";
  const recKey = recommendation.toUpperCase();
  const recLabel = REC_LABELS[lang]?.[recKey] ?? recommendation;
  const recColor =
    recKey === "BUY"   ? "text-success" :
    recKey === "AVOID" ? "text-destructive" :
    "text-warning";

  const fieldLabel = (key: string) =>
    t(`aiAnalysis.fieldLabels.${key}`, key.replace(/([A-Z])/g, " $1"));

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-5 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("aiAnalysis.title")}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${recColor} bg-card border border-border`}>
            {recLabel}
          </span>
        </div>
        {analysis.summary && <p className="text-sm text-muted-foreground mt-2 leading-relaxed" dir="auto">{analysis.summary}</p>}
      </div>

      <div className="divide-y divide-border">

        {analysis.investmentScore && (
          <Section title={t("aiAnalysis.investmentScore")} icon={<Target className="w-4 h-4" />} id="score" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(analysis.investmentScore).map(([k, v]) => (
                <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">{v as number}</p>
                  <p className="text-xs text-muted-foreground">{fieldLabel(k)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {analysis.swot && (
          <Section title={t("aiAnalysis.swot")} icon={<BarChart3 className="w-4 h-4" />} id="swot" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-2 gap-3">
              <SwotBox label={t("aiAnalysis.strengths")}     items={analysis.swot.strengths}     icon={<CheckCircle className="w-3.5 h-3.5 text-success" />} />
              <SwotBox label={t("aiAnalysis.weaknesses")}    items={analysis.swot.weaknesses}    icon={<XCircle className="w-3.5 h-3.5 text-destructive" />} />
              <SwotBox label={t("aiAnalysis.opportunities")} items={analysis.swot.opportunities} icon={<TrendingUp className="w-3.5 h-3.5 text-primary" />} />
              <SwotBox label={t("aiAnalysis.threats")}       items={analysis.swot.threats}       icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} />
            </div>
          </Section>
        )}

        {analysis.financials && (
          <Section title={t("aiAnalysis.financials")} icon={<DollarSign className="w-4 h-4" />} id="fin" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.financials).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{fieldLabel(k)}</span>
                  <span className="font-medium text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {analysis.risk && (
          <Section title={t("aiAnalysis.risk")} icon={<Shield className="w-4 h-4" />} id="risk" expanded={expanded} toggle={toggle}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-foreground">{analysis.risk.overallScore}/100</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                analysis.risk.level === "low"  ? "bg-success/10 text-success" :
                analysis.risk.level === "high" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"}`}>
                {LEVEL_LABELS[lang]?.[analysis.risk.level] ?? analysis.risk.level?.toUpperCase()}
              </span>
            </div>
            {analysis.risk.factors?.map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-sm py-1 border-t border-border/50">
                <span className="text-muted-foreground" dir="auto">{f.name}</span>
                <span className="text-foreground">{f.score}/100</span>
              </div>
            ))}
          </Section>
        )}

        {analysis.demographics && (
          <Section title={t("aiAnalysis.demographics")} icon={<Users className="w-4 h-4" />} id="demo" expanded={expanded} toggle={toggle}>
            {Object.entries(analysis.demographics).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{fieldLabel(k)}</span>
                <span className="font-medium text-foreground">{String(v)}</span>
              </div>
            ))}
          </Section>
        )}

        {analysis.marketInsights && (
          <Section title={t("aiAnalysis.market")} icon={<TrendingUp className="w-4 h-4" />} id="market" expanded={expanded} toggle={toggle}>
            {Object.entries(analysis.marketInsights).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{fieldLabel(k)}</span>
                <span className="font-medium text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
              </div>
            ))}
          </Section>
        )}

        {analysis.esg && (
          <Section title={t("aiAnalysis.esg")} icon={<Leaf className="w-4 h-4" />} id="esg" expanded={expanded} toggle={toggle}>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {["score","environmental","social","governance"].map(k => (
                <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">{analysis.esg[k]}</p>
                  <p className="text-xs text-muted-foreground">{fieldLabel(k)}</p>
                </div>
              ))}
            </div>
            {analysis.esg.notes && <p className="text-xs text-muted-foreground mt-1" dir="auto">{analysis.esg.notes}</p>}
          </Section>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading} className="flex-1">
          {loading && <Loader2 className="w-3 h-3 me-1 animate-spin" />}
          {t("aiAnalysis.rerun")}
        </Button>
        <Button
          size="sm"
          onClick={downloadReport}
          className="flex-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-medium"
          variant="outline"
        >
          <Download className="w-3.5 h-3.5 me-1.5" />
          Download Report
        </Button>
      </div>
    </div>
  );
}
