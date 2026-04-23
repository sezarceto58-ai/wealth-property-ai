import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";

interface PricingTabProps {
  r: any;
  onPricingUpdate?: (pricing: any) => void;
}

const copy = {
  en: { clickToEdit: "Click to edit", pricePerSqm: "Price / m²", pricePerSqft: "Price / ft²", currency: "Currency", byUnit: "Pricing by Unit Type", type: "Type", areaSqm: "Area (m²)", areaSqft: "Area (ft²)", unitPrice: "Unit Price", floorPremium: "Floor Premium Pricing", floor: "Floor", premium: "Premium", base: "Base", paymentPlans: "Payment Plans", installments: "Installments", duration: "Duration", monthly: "Monthly ~", clickHint: "Click any price to edit. Changes are saved to your plan automatically.", down: "down" },
  ar: { clickToEdit: "انقر للتعديل", pricePerSqm: "السعر / م²", pricePerSqft: "السعر / قدم²", currency: "العملة", byUnit: "التسعير حسب نوع الوحدة", type: "النوع", areaSqm: "المساحة (م²)", areaSqft: "المساحة (قدم²)", unitPrice: "سعر الوحدة", floorPremium: "تسعير علاوة الطوابق", floor: "الطابق", premium: "العلاوة", base: "أساسي", paymentPlans: "خطط الدفع", installments: "الأقساط", duration: "المدة", monthly: "شهرياً ~", clickHint: "انقر على أي سعر لتعديله. تُحفظ التغييرات تلقائياً في خطتك.", down: "دفعة أولى" },
  ku: { clickToEdit: "بۆ دەستکاریکردن کرتە بکە", pricePerSqm: "نرخ / م²", pricePerSqft: "نرخ / پێ²", currency: "دراو", byUnit: "نرخدانان بەپێی جۆری یەکە", type: "جۆر", areaSqm: "بوار (م²)", areaSqft: "بوار (پێ²)", unitPrice: "نرخی یەکە", floorPremium: "نرخدانانی زیادەی نهۆم", floor: "نهۆم", premium: "زیادە", base: "بنەڕەت", paymentPlans: "پلانەکانی پارەدان", installments: "قیستەکان", duration: "ماوە", monthly: "مانگانە ~", clickHint: "بۆ دەستکاریکردنی هەر نرخێک کرتە بکە. گۆڕانکارییەکان خۆکارانە دەپارێزرێن.", down: "پێشەکی" },
} as const;

export default function PricingTab({ r, onPricingUpdate }: PricingTabProps) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);
  const p = r.pricing || {};
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localPricing, setLocalPricing] = useState(p);

  const startEdit = (key: string, currentValue: number) => {
    setEditingCell(key);
    setEditValue(String(currentValue || ""));
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = (path: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) { cancelEdit(); return; }
    const updated = { ...localPricing };
    if (path.startsWith("unit_")) {
      const [, idx, field] = path.split("_");
      const i = parseInt(idx);
      if (updated.by_unit_type?.[i]) {
        updated.by_unit_type = [...updated.by_unit_type];
        updated.by_unit_type[i] = { ...updated.by_unit_type[i], [field]: val };
      }
    } else if (path.startsWith("floor_")) {
      const [, idx, field] = path.split("_");
      const i = parseInt(idx);
      if (updated.by_floor?.[i]) {
        updated.by_floor = [...updated.by_floor];
        updated.by_floor[i] = { ...updated.by_floor[i], [field]: val };
      }
    } else if (path.startsWith("plan_")) {
      const [, idx, field] = path.split("_");
      const i = parseInt(idx);
      if (updated.payment_plans?.[i]) {
        updated.payment_plans = [...updated.payment_plans];
        updated.payment_plans[i] = { ...updated.payment_plans[i], [field]: val };
      }
    } else {
      (updated as any)[path] = val;
    }
    setLocalPricing(updated);
    onPricingUpdate?.(updated);
    cancelEdit();
  };

  const EditableCell = ({ cellKey, value, className = "" }: { cellKey: string; value: number | undefined; className?: string }) => {
    const isEditing = editingCell === cellKey;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 w-24 text-xs" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cellKey); if (e.key === "Escape") cancelEdit(); }} />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveEdit(cellKey)}><Check className="w-3 h-3 text-primary" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="w-3 h-3 text-muted-foreground" /></Button>
        </div>
      );
    }
    return (
      <span className={`cursor-pointer hover:bg-accent/50 rounded px-1 py-0.5 transition-colors group inline-flex items-center gap-1 ${className}`} onClick={() => startEdit(cellKey, value || 0)} title={ui.clickToEdit}>
        ${value?.toLocaleString() ?? "—"}
        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: ui.pricePerSqm, key: "price_per_sqm", value: localPricing.price_per_sqm },
          { label: ui.pricePerSqft, key: "price_per_sqft", value: localPricing.price_per_sqft },
          { label: ui.currency, key: null, value: localPricing.currency || "USD" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            {kpi.key ? <div className="text-xl font-bold text-foreground"><EditableCell cellKey={kpi.key} value={kpi.value} /></div> : <p className="text-xl font-bold text-foreground">{kpi.value}</p>}
          </div>
        ))}
      </div>

      {localPricing.by_unit_type?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">{ui.byUnit}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left"><th className="py-2 text-muted-foreground font-medium">{ui.type}</th><th className="py-2 text-right text-muted-foreground font-medium">{ui.areaSqm}</th><th className="py-2 text-right text-muted-foreground font-medium">{ui.areaSqft}</th><th className="py-2 text-right text-muted-foreground font-medium">$/m²</th><th className="py-2 text-right text-muted-foreground font-medium">$/ft²</th><th className="py-2 text-right text-muted-foreground font-medium">{ui.unitPrice}</th></tr></thead>
              <tbody>
                {localPricing.by_unit_type.map((u: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 text-foreground font-medium">{u.type}</td>
                    <td className="py-2 text-right text-foreground">{u.area_sqm}</td>
                    <td className="py-2 text-right text-foreground">{u.area_sqft}</td>
                    <td className="py-2 text-right text-foreground"><EditableCell cellKey={`unit_${i}_price_per_sqm`} value={u.price_per_sqm} /></td>
                    <td className="py-2 text-right text-foreground"><EditableCell cellKey={`unit_${i}_price_per_sqft`} value={u.price_per_sqft} /></td>
                    <td className="py-2 text-right text-foreground font-bold"><EditableCell cellKey={`unit_${i}_price_per_unit`} value={u.price_per_unit} className="font-bold" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {localPricing.by_floor?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">{ui.floorPremium}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left"><th className="py-2 text-muted-foreground font-medium">{ui.floor}</th><th className="py-2 text-right text-muted-foreground font-medium">{ui.premium}</th><th className="py-2 text-right text-muted-foreground font-medium">$/m²</th></tr></thead>
              <tbody>
                {localPricing.by_floor.map((f: any, i: number) => (
                  <tr key={f.floor} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{ui.floor} {f.floor}</td>
                    <td className="py-2 text-right text-foreground">{f.premium_pct > 0 ? `+${f.premium_pct}%` : ui.base}</td>
                    <td className="py-2 text-right text-foreground font-medium"><EditableCell cellKey={`floor_${i}_price_per_sqm`} value={f.price_per_sqm} className="font-medium" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {localPricing.payment_plans?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">{ui.paymentPlans}</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {localPricing.payment_plans.map((pp: any, i: number) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center gap-2"><h5 className="font-semibold text-foreground text-sm">{pp.name}</h5><Badge variant="secondary" className="text-xs">{pp.down_payment_pct}% {ui.down}</Badge></div>
                <p className="text-xs text-muted-foreground">{pp.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">{ui.installments}:</span> <span className="text-foreground font-medium">{pp.installments}</span></div>
                  <div><span className="text-muted-foreground">{ui.duration}:</span> <span className="text-foreground font-medium">{pp.duration_months} mo</span></div>
                  {pp.monthly_payment_example && <div className="col-span-2"><span className="text-muted-foreground">{ui.monthly} </span><EditableCell cellKey={`plan_${i}_monthly_payment_example`} value={pp.monthly_payment_example} className="font-medium" /></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {onPricingUpdate && <p className="text-xs text-muted-foreground text-center"><Pencil className="w-3 h-3 inline mr-1" />{ui.clickHint}</p>}
    </div>
  );
}
