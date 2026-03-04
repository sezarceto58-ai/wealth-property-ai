import { Badge } from "@/components/ui/badge";
import { Building2, ParkingCircle, Trees } from "lucide-react";

export default function DesignTab({ r }: { r: any }) {
  const d = r.design || {};
  return (
    <div className="space-y-5">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Buildings", value: d.buildings_count || 1 },
          { label: "Shape", value: d.building_shape || d.floors ? `${d.building_shape || "Tower"}` : "—" },
          { label: "Floors", value: d.floors },
          { label: "Total Units", value: d.total_units || (d.floors || 0) * (d.units_per_floor || 0) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground">{kpi.value ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Areas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Commercial Area", value: d.commercial_area_sqm ? `${d.commercial_area_sqm.toLocaleString()} m²` : "—", icon: Building2 },
          { label: "Green Area", value: d.green_area_sqm ? `${d.green_area_sqm.toLocaleString()} m²` : "—", icon: Trees },
          { label: "Parking Spaces", value: d.parking_spaces ?? "—", icon: ParkingCircle },
          { label: "Basement Levels", value: d.basement_levels ?? 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Facilities */}
      {d.facilities?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Facilities & Amenities</h4>
          <div className="flex flex-wrap gap-2">{d.facilities.map((f: string) => (
            <Badge key={f} className="text-xs bg-primary/10 text-primary border-0">{f}</Badge>
          ))}</div>
        </div>
      )}

      {/* Unit Types Table */}
      {d.unit_types?.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Unit Types Detail</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 text-muted-foreground font-medium">Type</th>
                  <th className="py-2 text-muted-foreground font-medium">Area</th>
                  <th className="py-2 text-muted-foreground font-medium">Count</th>
                  <th className="py-2 text-muted-foreground font-medium">Bed</th>
                  <th className="py-2 text-muted-foreground font-medium">Bath</th>
                  <th className="py-2 text-muted-foreground font-medium">Balcony</th>
                  <th className="py-2 text-muted-foreground font-medium">Kitchen</th>
                  <th className="py-2 text-muted-foreground font-medium">Ceiling</th>
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

      {/* Design Rationale */}
      {d.design_rationale && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Design Rationale</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{d.design_rationale}</p>
        </div>
      )}
    </div>
  );
}
