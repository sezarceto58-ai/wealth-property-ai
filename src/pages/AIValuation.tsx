/**
 * AI Property Valuation — Deep Details Form
 * Multi-step form with map, condition, view, environment, and luxury extras.
 * Free for all roles — 2 uses tracked per user.
 */

import { useState, lazy, Suspense } from "react";
import {
  TrendingUp, MapPin, Building2, Layers, Eye, Sun, Settings2,
  Sparkles, ChevronDown, ChevronUp, CheckCircle2, Home,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import AIValuationWidget from "@/components/AIValuationWidget";
import type { ValuationInput } from "@/services/valuationEngine";

const MapPicker = lazy(() => import("@/components/MapPicker"));

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const CITIES    = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah"];
const DISTRICTS: Record<string, string[]> = {
  Erbil:        ["Ankawa", "Gulan", "Shorsh", "Sarchinar", "Koya", "Ainkawa"],
  Baghdad:      ["Mansour", "Karrada", "Jadriya", "Zayouna", "Adhamiya", "Sadr City"],
  Basra:        ["Ashar", "Brazilja"],
  Sulaymaniyah: ["Bakhtiari", "Qadisiyah"],
};
const TYPES     = ["Apartment", "Villa", "Townhouse", "Penthouse", "Commercial", "Office", "Land", "Warehouse"];
const VIEWS     = [
  { id: "sea",       label: "Sea / Lake",       icon: "🌊" },
  { id: "mountain",  label: "Mountain",          icon: "⛰️" },
  { id: "city",      label: "City Skyline",      icon: "🏙️" },
  { id: "open",      label: "Open / Green",      icon: "🌿" },
  { id: "garden",    label: "Garden",            icon: "🌳" },
  { id: "courtyard", label: "Courtyard",         icon: "🏛️" },
  { id: "street",    label: "Street",            icon: "🛣️" },
];
const FACILITIES = [
  { id: "school",     label: "School",           icon: "🏫" },
  { id: "hospital",   label: "Hospital",         icon: "🏥" },
  { id: "mosque",     label: "Mosque",           icon: "🕌" },
  { id: "mall",       label: "Shopping Mall",    icon: "🏬" },
  { id: "park",       label: "Park",             icon: "🌲" },
  { id: "university", label: "University",       icon: "🎓" },
  { id: "metro",      label: "Metro / Bus",      icon: "🚇" },
  { id: "restaurant", label: "Restaurants",      icon: "🍽️" },
  { id: "gym",        label: "Public Gym",       icon: "💪" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default state
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT: ValuationInput = {
  price: 350000, area: 200, bedrooms: 3, bathrooms: 2,
  city: "Erbil", district: "Ankawa", propertyType: "Villa",
  age: 5, verified: false, features: [],
  lat: 36.191, lng: 44.009,
  locationType: "residential", streetWidth: "medium",
  nearbyFacilities: [],
  floors: 2, hasGarden: false, gardenArea: 0, hasRooftop: false, hasBasement: false,
  floorLevel: undefined, buildingFloors: undefined, hasElevator: false,
  balconies: 1, balconyArea: 15,
  view: [],
  condition: "good", interiorCladding: "ceramic", exteriorCladding: "painted",
  naturalLight: "good", sunExposure: "morning", noiseLevel: "quiet",
  hasGenerator: false, hasSolarPanels: false, hasWaterTank: true,
  hasCentralAC: false, hasHeating: false, hasSecuritySystem: false,
  parkingSpaces: 1,
  hasPool: false, hasGym: false, hasSmartHome: false, hasConcierge: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const isVillaType = (t: string) => ["Villa", "Townhouse"].includes(t);
const isAptType   = (t: string) => ["Apartment", "Penthouse"].includes(t);

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel = ({ text, optional }: { text: string; optional?: boolean }) => (
  <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
    {text}
    {optional && <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>}
  </label>
);

const SelectField = ({
  value, onChange, options, className = "",
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Toggle = ({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className="flex items-center gap-3 text-left w-full group"
  >
    <div className={`w-10 h-6 rounded-full flex items-center transition-colors shrink-0 ${value ? "bg-primary" : "bg-secondary border border-border"}`}>
      <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${value ? "translate-x-4" : "translate-x-0"}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  </button>
);

const TagGrid = ({
  items, selected, onToggle, cols = 3,
}: { items: { id: string; label: string; icon?: string }[]; selected: string[]; onToggle: (id: string) => void; cols?: number }) => (
  <div className={`grid gap-2 grid-cols-2 sm:grid-cols-${cols}`}>
    {items.map(item => {
      const active = selected.includes(item.id);
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onToggle(item.id)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            active
              ? "bg-primary/10 border-primary text-primary"
              : "bg-secondary/40 border-border text-foreground hover:border-primary/30"
          }`}
        >
          {item.icon && <span className="text-base">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
          {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0 text-primary" />}
        </button>
      );
    })}
  </div>
);

type RadioOption = { value: string; label: string; sub?: string };
const RadioGroup = ({
  options, value, onChange, cols = 2,
}: { options: RadioOption[]; value: string; onChange: (v: string) => void; cols?: number }) => (
  <div className={`grid gap-2 grid-cols-${cols} sm:grid-cols-${Math.min(cols + 1, 4)}`}>
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex flex-col px-3 py-2.5 rounded-xl text-sm border transition-all text-left ${
          value === o.value
            ? "bg-primary/10 border-primary text-primary"
            : "bg-secondary/40 border-border text-foreground hover:border-primary/30"
        }`}
      >
        <span className="font-medium">{o.label}</span>
        {o.sub && <span className="text-[10px] text-muted-foreground mt-0.5">{o.sub}</span>}
      </button>
    ))}
  </div>
);

// Accordion section
const Section = ({
  icon: Icon, title, children, defaultOpen = true, badge,
}: { icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground text-sm">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">{children}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function AIValuationPage() {
  const [d, setD] = useState<ValuationInput>(DEFAULT);
  const [ready, setReady] = useState(false);
  const [key, setKey] = useState(0);

  const set = (field: Partial<ValuationInput>) => {
    setD(prev => ({ ...prev, ...field }));
    setReady(false);
  };

  const toggleArr = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const fc = `w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`;

  const isVilla = isVillaType(d.propertyType);
  const isApt   = isAptType(d.propertyType);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> AI Property Valuation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in as many details as possible for the most accurate valuation.
          <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">Free · 2 uses per account.</span>
        </p>
      </div>

      {/* ── Section 1: Core Details ── */}
      <Section icon={Building2} title="Property Basics" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel text="Asking Price ($)" />
            <Input type="number" value={d.price} onChange={e => set({ price: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Built Area (m²)" />
            <Input type="number" value={d.area} onChange={e => set({ area: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Bedrooms" />
            <Input type="number" value={d.bedrooms} onChange={e => set({ bedrooms: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Bathrooms" />
            <Input type="number" value={d.bathrooms} onChange={e => set({ bathrooms: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Age (years)" />
            <Input type="number" value={d.age ?? 5} onChange={e => set({ age: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Property Type" />
            <SelectField
              value={d.propertyType}
              onChange={v => set({ propertyType: v })}
              options={TYPES.map(t => ({ value: t, label: t }))}
            />
          </div>
        </div>

        {/* Villa/house extras */}
        {isVilla && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <FieldLabel text="Floors in Property" />
              <Input type="number" value={d.floors ?? 2} onChange={e => set({ floors: +e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <FieldLabel text="Parking Spaces" />
              <Input type="number" value={d.parkingSpaces ?? 1} onChange={e => set({ parkingSpaces: +e.target.value })} className="rounded-xl" />
            </div>
            <div className="col-span-2 space-y-3">
              <Toggle value={!!d.hasGarden} onChange={v => set({ hasGarden: v })} label="Has Private Garden" />
              {d.hasGarden && (
                <div>
                  <FieldLabel text="Garden Area (m²)" optional />
                  <Input type="number" value={d.gardenArea ?? 0} onChange={e => set({ gardenArea: +e.target.value })} className="rounded-xl" />
                </div>
              )}
              <Toggle value={!!d.hasRooftop} onChange={v => set({ hasRooftop: v })} label="Has Rooftop / Terrace" />
              {d.hasRooftop && (
                <div>
                  <FieldLabel text="Rooftop Area (m²)" optional />
                  <Input type="number" value={d.rooftopArea ?? 0} onChange={e => set({ rooftopArea: +e.target.value })} className="rounded-xl" />
                </div>
              )}
              <Toggle value={!!d.hasBasement} onChange={v => set({ hasBasement: v })} label="Has Basement" />
            </div>
          </div>
        )}

        {/* Apartment extras */}
        {isApt && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <FieldLabel text="Unit Floor" />
              <Input type="number" value={d.floorLevel ?? 3} onChange={e => set({ floorLevel: +e.target.value })} className="rounded-xl" placeholder="e.g. 3" />
            </div>
            <div>
              <FieldLabel text="Building Total Floors" />
              <Input type="number" value={d.buildingFloors ?? 10} onChange={e => set({ buildingFloors: +e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <FieldLabel text="Parking Spaces" optional />
              <Input type="number" value={d.parkingSpaces ?? 1} onChange={e => set({ parkingSpaces: +e.target.value })} className="rounded-xl" />
            </div>
            <div className="flex items-end pb-1">
              <Toggle value={!!d.hasElevator} onChange={v => set({ hasElevator: v })} label="Building has Elevator" />
            </div>
          </div>
        )}

        {/* Balconies */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <FieldLabel text="Number of Balconies" optional />
            <Input type="number" value={d.balconies ?? 0} onChange={e => set({ balconies: +e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <FieldLabel text="Total Balcony Area (m²)" optional />
            <Input type="number" value={d.balconyArea ?? 0} onChange={e => set({ balconyArea: +e.target.value })} className="rounded-xl" />
          </div>
        </div>
      </Section>

      {/* ── Section 2: Location ── */}
      <Section icon={MapPin} title="Location & Map">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel text="City" />
            <SelectField
              value={d.city}
              onChange={v => set({ city: v, district: DISTRICTS[v]?.[0] ?? "" })}
              options={CITIES.map(c => ({ value: c, label: c }))}
            />
          </div>
          <div>
            <FieldLabel text="District / Neighborhood" />
            <SelectField
              value={d.district}
              onChange={v => set({ district: v })}
              options={(DISTRICTS[d.city] ?? []).map(x => ({ value: x, label: x }))}
            />
          </div>
        </div>

        {/* Map */}
        <div>
          <FieldLabel text="Pin Location on Map" optional />
          <p className="text-xs text-muted-foreground mb-2">Click the map to set the exact property location for a more precise valuation.</p>
          <Suspense fallback={<div className="h-64 rounded-xl bg-secondary animate-pulse" />}>
            <MapPicker
              lat={d.lat ?? 36.191}
              lng={d.lng ?? 44.009}
              onLocationChange={(lat, lng) => set({ lat, lng })}
            />
          </Suspense>
          {d.lat && d.lng && (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {d.lat.toFixed(5)}, {d.lng.toFixed(5)}
            </p>
          )}
        </div>

        {/* Street width */}
        <div>
          <FieldLabel text="Street Width" optional />
          <RadioGroup
            value={d.streetWidth ?? "medium"}
            onChange={v => set({ streetWidth: v as ValuationInput["streetWidth"] })}
            options={[
              { value: "narrow",         label: "Narrow",         sub: "< 6m" },
              { value: "medium",         label: "Medium",         sub: "6–12m" },
              { value: "wide",           label: "Wide",           sub: "12–20m" },
              { value: "main_boulevard", label: "Boulevard",      sub: "> 20m" },
            ]}
            cols={2}
          />
        </div>

        {/* Location type */}
        <div>
          <FieldLabel text="Location Type" optional />
          <RadioGroup
            value={d.locationType ?? "residential"}
            onChange={v => set({ locationType: v as ValuationInput["locationType"] })}
            options={[
              { value: "residential",    label: "Residential",   sub: "Quiet area" },
              { value: "commercial_mix", label: "Mixed Use",     sub: "Shops nearby" },
              { value: "main_road",      label: "Main Road",     sub: "High traffic" },
              { value: "corner_plot",    label: "Corner Plot",   sub: "Extra exposure" },
              { value: "gated_compound", label: "Gated",         sub: "Compound/complex" },
              { value: "cul_de_sac",     label: "Cul-de-sac",   sub: "Dead end, quiet" },
            ]}
            cols={2}
          />
        </div>

        {/* Nearby facilities */}
        <div>
          <FieldLabel text="Nearby Facilities" optional />
          <TagGrid
            items={FACILITIES}
            selected={d.nearbyFacilities ?? []}
            onToggle={id => set({ nearbyFacilities: toggleArr(d.nearbyFacilities ?? [], id) })}
            cols={3}
          />
        </div>
      </Section>

      {/* ── Section 3: Condition & Finish ── */}
      <Section icon={Layers} title="Condition & Finish">
        <div>
          <FieldLabel text="Overall Condition" />
          <RadioGroup
            value={d.condition ?? "good"}
            onChange={v => set({ condition: v as ValuationInput["condition"] })}
            options={[
              { value: "luxury",           label: "Luxury",         sub: "Ultra-premium" },
              { value: "excellent",        label: "Excellent",      sub: "Like new" },
              { value: "good",             label: "Good",           sub: "Well maintained" },
              { value: "fair",             label: "Fair",           sub: "Average" },
              { value: "needs_renovation", label: "Needs Work",     sub: "Minor renovation" },
              { value: "needs_major_work", label: "Major Work",     sub: "Full renovation" },
            ]}
            cols={2}
          />
        </div>

        <div>
          <FieldLabel text="Interior Floor Cladding" optional />
          <RadioGroup
            value={d.interiorCladding ?? "ceramic"}
            onChange={v => set({ interiorCladding: v as ValuationInput["interiorCladding"] })}
            options={[
              { value: "marble",   label: "Marble",      sub: "Premium" },
              { value: "parquet",  label: "Parquet",     sub: "Hardwood" },
              { value: "ceramic",  label: "Ceramic",     sub: "Standard" },
              { value: "mixed",    label: "Mixed",       sub: "Various" },
              { value: "basic",    label: "Basic",       sub: "Cement/plain" },
            ]}
            cols={2}
          />
        </div>

        <div>
          <FieldLabel text="Exterior / Facade Cladding" optional />
          <RadioGroup
            value={d.exteriorCladding ?? "painted"}
            onChange={v => set({ exteriorCladding: v as ValuationInput["exteriorCladding"] })}
            options={[
              { value: "stone_facade",    label: "Natural Stone",    sub: "High prestige" },
              { value: "glass_curtain",   label: "Glass Curtain",    sub: "Modern" },
              { value: "modern_cladding", label: "Modern Cladding",  sub: "Contemporary" },
              { value: "painted",         label: "Painted",          sub: "Standard" },
              { value: "brick",           label: "Brick",            sub: "Traditional" },
            ]}
            cols={2}
          />
        </div>
      </Section>

      {/* ── Section 4: View & Environment ── */}
      <Section icon={Eye} title="View & Environment">
        <div>
          <FieldLabel text="Property View" optional />
          <p className="text-xs text-muted-foreground mb-2">Select all views visible from the property.</p>
          <TagGrid
            items={VIEWS}
            selected={d.view ?? []}
            onToggle={id => set({ view: toggleArr(d.view ?? [], id) })}
            cols={3}
          />
        </div>

        <div>
          <FieldLabel text="Natural Light" optional />
          <RadioGroup
            value={d.naturalLight ?? "good"}
            onChange={v => set({ naturalLight: v as ValuationInput["naturalLight"] })}
            options={[
              { value: "excellent", label: "Excellent",   sub: "Bright all day" },
              { value: "good",      label: "Good",        sub: "Well-lit" },
              { value: "limited",   label: "Limited",     sub: "Dark/shaded" },
            ]}
            cols={3}
          />
        </div>

        <div>
          <FieldLabel text="Sun Entry" optional />
          <RadioGroup
            value={d.sunExposure ?? "morning"}
            onChange={v => set({ sunExposure: v as ValuationInput["sunExposure"] })}
            options={[
              { value: "all_day",   label: "All Day",      sub: "Full sun" },
              { value: "morning",   label: "Morning",      sub: "East facing" },
              { value: "afternoon", label: "Afternoon",    sub: "West facing" },
              { value: "limited",   label: "Limited",      sub: "Shaded" },
            ]}
            cols={2}
          />
        </div>

        <div>
          <FieldLabel text="Noise Level / Ambience" optional />
          <RadioGroup
            value={d.noiseLevel ?? "quiet"}
            onChange={v => set({ noiseLevel: v as ValuationInput["noiseLevel"] })}
            options={[
              { value: "very_quiet", label: "Very Quiet",    sub: "Serene, calm" },
              { value: "quiet",      label: "Quiet",         sub: "Residential calm" },
              { value: "moderate",   label: "Moderate",      sub: "Some traffic" },
              { value: "busy",       label: "Busy / Noisy",  sub: "Main road noise" },
            ]}
            cols={2}
          />
        </div>
      </Section>

      {/* ── Section 5: Utilities & Systems ── */}
      <Section icon={Settings2} title="Utilities & Systems" defaultOpen={false} badge="optional">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle value={!!d.hasCentralAC}      onChange={v => set({ hasCentralAC: v })}      label="Central Air Conditioning" />
          <Toggle value={!!d.hasHeating}         onChange={v => set({ hasHeating: v })}         label="Central Heating" />
          <Toggle value={!!d.hasGenerator}       onChange={v => set({ hasGenerator: v })}       label="Private Generator" />
          <Toggle value={!!d.hasSolarPanels}     onChange={v => set({ hasSolarPanels: v })}     label="Solar Panels" sub="+2.5% value" />
          <Toggle value={!!d.hasWaterTank}       onChange={v => set({ hasWaterTank: v })}       label="Water Storage Tank" />
          <Toggle value={!!d.hasSecuritySystem}  onChange={v => set({ hasSecuritySystem: v })}  label="Security / CCTV System" />
          <Toggle value={!!d.hasSmartHome}       onChange={v => set({ hasSmartHome: v })}       label="Smart Home System" sub="+4% value" />
        </div>
      </Section>

      {/* ── Section 6: Luxury & Extras ── */}
      <Section icon={Sparkles} title="Luxury & Premium Extras" defaultOpen={false} badge="optional">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle value={!!d.hasPool}      onChange={v => set({ hasPool: v })}      label="Swimming Pool" sub="+6% value" />
          <Toggle value={!!d.hasGym}       onChange={v => set({ hasGym: v })}       label="Private Gym / Fitness" sub="+3% value" />
          <Toggle value={!!d.hasConcierge} onChange={v => set({ hasConcierge: v })} label="Concierge Service" sub="+3% value" />
        </div>
        <div className="pt-2 border-t border-border">
          <Toggle value={!!d.verified} onChange={v => set({ verified: v })} label="Platform-Verified Listing" sub="+3% trust premium" />
        </div>
      </Section>

      {/* ── Run Button ── */}
      <button
        type="button"
        onClick={() => { setKey(k => k + 1); setReady(true); window.scrollTo({ top: 9999, behavior: "smooth" }); }}
        className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <TrendingUp className="w-5 h-5" />
        Calculate AI Valuation
      </button>

      {/* ── Result ── */}
      {ready && <AIValuationWidget key={key} input={d} />}
    </div>
  );
}
