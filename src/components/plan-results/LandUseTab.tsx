import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { MapPin, ThumbsUp, ThumbsDown, Compass, Landmark, Lightbulb, DollarSign, LayoutGrid } from "lucide-react";

const copy = {
  en: {
    na: "N/A",
    confidence: "confidence",
    mapTitle: "Location Map",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    neighborhood: "Neighborhood Intelligence",
    existing: "Existing Activities & Projects",
    upcoming: "Upcoming / Future Projects",
    infrastructure: "Infrastructure",
    zoning: "Zoning Validation",
    recommendations: "Development Recommendations",
    pricing: "Pricing Strategy",
    unitMix: "Unit Mix Optimization",
  },
  ar: {
    na: "غير متاح",
    confidence: "مستوى الثقة",
    mapTitle: "خريطة الموقع",
    strengths: "نقاط القوة",
    weaknesses: "نقاط الضعف",
    neighborhood: "ذكاء الحي",
    existing: "الأنشطة والمشاريع الحالية",
    upcoming: "المشاريع القادمة / المستقبلية",
    infrastructure: "البنية التحتية",
    zoning: "التحقق من التصنيف",
    recommendations: "توصيات التطوير",
    pricing: "استراتيجية التسعير",
    unitMix: "تحسين مزيج الوحدات",
  },
  ku: {
    na: "بەردەست نییە",
    confidence: "ئاستی متمانە",
    mapTitle: "نەخشەی شوێن",
    strengths: "خاڵە بەهێزەکان",
    weaknesses: "خاڵە لاوازەکان",
    neighborhood: "زیرەکی ناوچە",
    existing: "چالاکی و پرۆژە هەنووکەییەکان",
    upcoming: "پرۆژەکانی داهاتوو",
    infrastructure: "ژێرخان",
    zoning: "پشتڕاستکردنەوەی زۆنینگ",
    recommendations: "پێشنیارەکانی پەرەپێدان",
    pricing: "ستراتیژیی نرخدانان",
    unitMix: "باشترکردنی تێکەڵی یەکەکان",
  },
} as const;

export default function LandUseTab({ r, lat, lng }: { r: any; lat: number; lng: number }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);
  const lu = r.land_use || {};

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-foreground">{lu.recommendation || ui.na}</h3>
          {lu.confidence != null && (
            <Badge variant="secondary" className="text-xs">{(lu.confidence * 100).toFixed(0)}% {ui.confidence}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{lu.rationale}</p>
      </div>

      <div className="rounded-xl overflow-hidden border border-border">
        <iframe
          title={ui.mapTitle}
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {lu.strengths?.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-green-500" /> {ui.strengths}</h4>
            <ul className="space-y-1.5">{lu.strengths.map((s: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500 mt-0.5">✓</span>{s}</li>
            ))}</ul>
          </div>
        )}
        {lu.weaknesses?.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-destructive" /> {ui.weaknesses}</h4>
            <ul className="space-y-1.5">{lu.weaknesses.map((s: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-destructive mt-0.5">✗</span>{s}</li>
            ))}</ul>
          </div>
        )}
      </div>

      {lu.neighborhood && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Compass className="w-4 h-4" /> {ui.neighborhood}</h4>
          {lu.neighborhood.existing_activities?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{ui.existing}</p>
              <div className="flex flex-wrap gap-2">{lu.neighborhood.existing_activities.map((a: string) => (
                <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
              ))}</div>
            </div>
          )}
          {lu.neighborhood.upcoming_projects?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{ui.upcoming}</p>
              <div className="flex flex-wrap gap-2">{lu.neighborhood.upcoming_projects.map((a: string) => (
                <Badge key={a} className="text-xs bg-primary/10 text-primary border-0">{a}</Badge>
              ))}</div>
            </div>
          )}
          {lu.neighborhood.infrastructure?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{ui.infrastructure}</p>
              <div className="flex flex-wrap gap-2">{lu.neighborhood.infrastructure.map((a: string) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}</div>
            </div>
          )}
        </div>
      )}

      {lu.zoning && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Landmark className="w-4 h-4" /> {ui.zoning}</h4>
          <p className="text-sm text-muted-foreground">{lu.zoning.validation}</p>
          {lu.zoning.allowed_uses?.length > 0 && (
            <div className="flex flex-wrap gap-2">{lu.zoning.allowed_uses.map((u: string) => (
              <Badge key={u} variant="outline" className="text-xs">{u}</Badge>
            ))}</div>
          )}
          {lu.zoning.restrictions_analysis && <p className="text-sm text-muted-foreground">{lu.zoning.restrictions_analysis}</p>}
          {lu.zoning.recommendations && <p className="text-sm text-foreground font-medium">{lu.zoning.recommendations}</p>}
        </div>
      )}

      {lu.development_recommendations?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Lightbulb className="w-4 h-4" /> {ui.recommendations}</h4>
          <ul className="space-y-2">{lu.development_recommendations.map((rec: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary font-bold">{i + 1}.</span>{rec}</li>
          ))}</ul>
        </div>
      )}

      {lu.pricing_suggestions && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> {ui.pricing}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{lu.pricing_suggestions}</p>
        </div>
      )}
      {lu.unit_mix_optimization && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> {ui.unitMix}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{lu.unit_mix_optimization}</p>
        </div>
      )}
    </div>
  );
}
