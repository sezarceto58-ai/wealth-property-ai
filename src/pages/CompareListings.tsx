import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GitCompareArrows, X, Plus, MapPin, Loader2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import type { DbProperty } from "@/types/database";
import TerraScore from "@/components/TerraScore";
import property1 from "@/assets/property-1.jpg";

const compareFields: { label: string; key: keyof DbProperty; format?: (v: DbProperty) => string }[] = [
  { label: t("common.price"), key: "price", format: (p) => `$${p.price.toLocaleString()}` },
  { label: "Price (IQD)", key: "price_iqd", format: (p) => p.price_iqd ? `${p.price_iqd.toLocaleString()} IQD` : "—" },
  { label: t("common.type"), key: "property_type" },
  { label: t("valuation.city"), key: "city" },
  { label: "District", key: "district" },
  { label: "Bedrooms", key: "bedrooms" },
  { label: "Bathrooms", key: "bathrooms" },
  { label: "Area (m²)", key: "area" },
  { label: "AqarScore™", key: "terra_score" },
  { label: "AI Valuation", key: "ai_valuation", format: (p) => p.ai_valuation ? `$${p.ai_valuation.toLocaleString()}` : "—" },
  { label: t("common.verified"), key: "verified", format: (p) => p.verified ? "✅ Yes" : "❌ No" },
  { label: "Agent", key: "agent_name" },
  { label: "Views", key: "views" },
  { label: "Status", key: "status" },
];

export default function CompareListings() {
  const { t } = useTranslation();
  const { data: allProperties = [], isLoading } = useProperties();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-select first 2 when data loads
  const selected = selectedIds.length > 0 ? selectedIds : allProperties.slice(0, 2).map(p => p.id);
  const selectedProperties = selected.map((id) => allProperties.find((p) => p.id === id)).filter(Boolean) as DbProperty[];
  const available = allProperties.filter((p) => !selected.includes(p.id));

  const addProperty = (id: string) => {
    if (selected.length < 4) setSelectedIds([...selected, id]);
  };

  const removeProperty = (id: string) => {
    setSelectedIds(selected.filter((s) => s !== id));
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <GitCompareArrows className="w-6 h-6 text-primary" /> Compare Listings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Side-by-side property comparison.</p>
      </div>

      {selected.length < 4 && available.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center">Add:</span>
          {available.slice(0, 6).map((p) => (
            <button key={p.id} onClick={() => addProperty(p.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
              <Plus className="w-3 h-3" /> {p.title}
            </button>
          ))}
        </div>
      )}

      {selectedProperties.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${selectedProperties.length}, 1fr)` }}>
              <div />
              {selectedProperties.map((p) => (
                <div key={p.id} className="rounded-xl bg-card border border-border p-4 relative animate-fade-in">
                  <button onClick={() => removeProperty(p.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary text-muted-foreground"><X className="w-3 h-3" /></button>
                  <img src={p.property_images?.[0]?.url || property1} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h3 className="font-semibold text-foreground text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {p.city}, {p.district}</p>
                </div>
              ))}
            </div>

            {compareFields.map((field, i) => (
              <div key={field.key} className="grid gap-4 mt-1" style={{ gridTemplateColumns: `180px repeat(${selectedProperties.length}, 1fr)` }}>
                <div className={`flex items-center px-3 py-2.5 text-xs font-medium text-muted-foreground ${i % 2 === 0 ? "bg-secondary/50 rounded-l-lg" : ""}`}>{field.label}</div>
                {selectedProperties.map((p) => {
                  const val = field.format ? field.format(p) : String((p as any)[field.key] ?? "—");
                  return (
                    <div key={p.id} className={`flex items-center px-3 py-2.5 text-sm font-medium text-foreground ${i % 2 === 0 ? "bg-secondary/50" : ""}`}>
                      {field.key === "terra_score" ? (
                        <span className={`font-bold ${p.terra_score >= 80 ? "text-success" : p.terra_score >= 60 ? "text-warning" : "text-destructive"}`}>{p.terra_score}</span>
                      ) : val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
