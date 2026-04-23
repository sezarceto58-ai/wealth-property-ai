import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Target, Rocket, Palette } from "lucide-react";

const copy = {
  en: { timeline: "Timeline", months: "months", targetAudience: "Target Audience", channels: "Channels", positioning: "Market Positioning", offers: "Smart Offers & Promotions", conditions: "Conditions:", feasibility: "Feasibility:", launch: "Launch Strategy", digital: "Digital Strategy", branding: "Branding", off: "off", uptake: "uptake" },
  ar: { timeline: "المدة الزمنية", months: "شهر", targetAudience: "الجمهور المستهدف", channels: "القنوات", positioning: "التموضع السوقي", offers: "العروض والحملات الذكية", conditions: "الشروط:", feasibility: "الجدوى:", launch: "استراتيجية الإطلاق", digital: "الاستراتيجية الرقمية", branding: "الهوية", off: "خصم", uptake: "استجابة" },
  ku: { timeline: "ماوە", months: "مانگ", targetAudience: "ئامانجی جەماوەر", channels: "کەناڵەکان", positioning: "شوێنی بازاڕی", offers: "ئۆفەر و پڕۆمۆشنە زیرەکەکان", conditions: "مەرجەکان:", feasibility: "کارایی:", launch: "ستراتیژیی دەستپێک", digital: "ستراتیژیی دیجیتاڵ", branding: "براندینگ", off: "داشکان", uptake: "وەستاندن" },
} as const;

export default function MarketingTab({ r }: { r: any }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);
  const m = r.marketing || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">{ui.timeline}</p>
          <p className="text-xl font-bold text-foreground">{m.timeline_months || "—"} {ui.months}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center col-span-2">
          <p className="text-xs text-muted-foreground">{ui.targetAudience}</p>
          <p className="text-sm font-medium text-foreground mt-1">{m.target_audience || "—"}</p>
        </div>
      </div>

      {Array.isArray(m.channels) && m.channels.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Megaphone className="w-4 h-4" /> {ui.channels}</h4>
          <div className="flex flex-wrap gap-2">{m.channels.map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div>
        </div>
      )}

      {m.positioning && <div className="rounded-xl bg-card border border-border p-5 space-y-2"><h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Target className="w-4 h-4" /> {ui.positioning}</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{m.positioning}</p></div>}

      {Array.isArray(m.offers) && m.offers.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Rocket className="w-4 h-4" /> {ui.offers}</h4>
          <div className="space-y-3">
            {m.offers.map((o: any, i: number) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-semibold text-foreground text-sm">{o.name}</h5>
                  {o.discount_pct > 0 && <Badge className="text-xs bg-green-500/15 text-green-600 border-0">{o.discount_pct}% {ui.off}</Badge>}
                  {o.expected_uptake_pct && <Badge variant="secondary" className="text-xs">{o.expected_uptake_pct}% {ui.uptake}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{o.description}</p>
                {o.conditions && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{ui.conditions}</span> {o.conditions}</p>}
                {o.feasibility && <div className="rounded bg-muted/50 p-2"><p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{ui.feasibility}</span> {o.feasibility}</p></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {m.launch_strategy && <div className="rounded-xl bg-card border border-border p-5 space-y-2"><h4 className="text-sm font-semibold text-foreground">{ui.launch}</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{m.launch_strategy}</p></div>}
      {m.digital_strategy && <div className="rounded-xl bg-card border border-border p-5 space-y-2"><h4 className="text-sm font-semibold text-foreground">{ui.digital}</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{m.digital_strategy}</p></div>}
      {m.branding_suggestions && <div className="rounded-xl bg-card border border-border p-5 space-y-2"><h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Palette className="w-4 h-4" /> {ui.branding}</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{m.branding_suggestions}</p></div>}
    </div>
  );
}
