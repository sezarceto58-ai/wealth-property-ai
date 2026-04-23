import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Building2, ParkingCircle, Trees } from "lucide-react";

const copy = {
  en: { buildings: "Buildings", shape: "Shape", floors: "Floors", totalUnits: "Total Units", commercialArea: "Commercial Area", greenArea: "Green Area", parkingSpaces: "Parking Spaces", basementLevels: "Basement Levels", facilities: "Facilities & Amenities", unitTypes: "Unit Types Detail", type: "Type", area: "Area", count: "Count", bed: "Bed", bath: "Bath", balcony: "Balcony", kitchen: "Kitchen", ceiling: "Ceiling", rationale: "Design Rationale", tower: "Tower" },
  ar: { buildings: "المباني", shape: "الشكل", floors: "الطوابق", totalUnits: "إجمالي الوحدات", commercialArea: "المساحة التجارية", greenArea: "المساحة الخضراء", parkingSpaces: "مواقف السيارات", basementLevels: "طوابق القبو", facilities: "المرافق والخدمات", unitTypes: "تفاصيل أنواع الوحدات", type: "النوع", area: "المساحة", count: "العدد", bed: "غرف النوم", bath: "الحمامات", balcony: "الشرفة", kitchen: "المطبخ", ceiling: "الارتفاع", rationale: "مبررات التصميم", tower: "برج" },
  ku: { buildings: "بیناکان", shape: "شێوە", floors: "نهۆمەکان", totalUnits: "کۆی یەکەکان", commercialArea: "بواری بازرگانی", greenArea: "بواری سەوز", parkingSpaces: "شوێنەکانی پارکینگ", basementLevels: "نهۆمەکانی ژێرزەوی", facilities: "خزمەتگوزاری و تایبەتمەندییەکان", unitTypes: "وردەکاری جۆرەکانی یەکە", type: "جۆر", area: "بوار", count: "ژمارە", bed: "ژووری خەو", bath: "حمام", balcony: "بالکۆن", kitchen: "چێشتخانە", ceiling: "بەرزی", rationale: "هۆکاری دیزاین", tower: "برج" },
} as const;

export default function DesignTab({ r }: { r: any }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);
  const d = r.design || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: ui.buildings, value: d.buildings_count || 1 },
          { label: ui.shape, value: d.building_shape || d.floors ? `${d.building_shape || ui.tower}` : "—" },
          { label: ui.floors, value: d.floors },
          { label: ui.totalUnits, value: d.total_units || (d.floors || 0) * (d.units_per_floor || 0) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground">{kpi.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: ui.commercialArea, value: d.commercial_area_sqm ? `${d.commercial_area_sqm.toLocaleString()} m²` : "—", icon: Building2 },
          { label: ui.greenArea, value: d.green_area_sqm ? `${d.green_area_sqm.toLocaleString()} m²` : "—", icon: Trees },
          { label: ui.parkingSpaces, value: d.parking_spaces ?? "—", icon: ParkingCircle },
          { label: ui.basementLevels, value: d.basement_levels ?? 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {d.facilities?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">{ui.facilities}</h4>
          <div className="flex flex-wrap gap-2">{d.facilities.map((f: string) => (
            <Badge key={f} className="text-xs bg-primary/10 text-primary border-0">{f}</Badge>
          ))}</div>
        </div>
      )}

      {d.unit_types?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">{ui.unitTypes}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 text-muted-foreground font-medium">{ui.type}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.area}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.count}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.bed}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.bath}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.balcony}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.kitchen}</th>
                  <th className="py-2 text-muted-foreground font-medium">{ui.ceiling}</th>
                </tr>
              </thead>
              <tbody>
                {d.unit_types.map((u: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 text-foreground font-medium">{u.name}</td>
                    <td className="py-2 text-foreground">{u.area_sqm} m²</td>
                    <td className="py-2 text-foreground">{u.count}</td>
                    <td className="py-2 text-foreground">{u.bedrooms}</td>
                    <td className="py-2 text-foreground">{u.bathrooms}</td>
                    <td className="py-2 text-foreground">{u.balcony}</td>
                    <td className="py-2 text-foreground">{u.kitchen}</td>
                    <td className="py-2 text-foreground">{u.ceiling_height_m}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {d.design_rationale && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">{ui.rationale}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{d.design_rationale}</p>
        </div>
      )}
    </div>
  );
}
