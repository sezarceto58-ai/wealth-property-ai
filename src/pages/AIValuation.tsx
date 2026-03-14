/**
 * AI Valuation Page
 * ─────────────────
 * Available to all roles. Users enter property details manually and
 * get the AI valuation result. Free tier: 2 uses total.
 * Accessible at: /buyer/valuation · /seller/valuation · /developer/valuation
 */

import { useState } from "react";
import { TrendingUp, Building2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import AIValuationWidget from "@/components/AIValuationWidget";
import type { ValuationInput } from "@/services/valuationEngine";

const CITIES = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah"];
const DISTRICTS: Record<string, string[]> = {
  Erbil:          ["Ankawa", "Gulan", "Shorsh", "Sarchinar", "Koya"],
  Baghdad:        ["Mansour", "Karrada", "Jadriya", "Zayouna", "Adhamiya", "Sadr City"],
  Basra:          ["Ashar", "Brazilja"],
  Sulaymaniyah:   ["Bakhtiari", "Qadisiyah"],
};
const PROPERTY_TYPES = ["Apartment", "Villa", "Commercial", "Penthouse", "Townhouse", "Land", "Office"];

const DEFAULT: ValuationInput = {
  price: 350000,
  area: 200,
  bedrooms: 3,
  bathrooms: 2,
  city: "Erbil",
  district: "Ankawa",
  propertyType: "Villa",
  age: 5,
  verified: false,
  features: [],
};

const FEATURES = ["Pool", "Smart Home", "Mountain View", "Sea View", "Garden", "Gym", "Parking", "Balcony"];

export default function AIValuationPage() {
  const [input, setInput] = useState<ValuationInput>(DEFAULT);
  const [ready, setReady] = useState(false);
  const [key, setKey] = useState(0); // reset widget when re-running

  const set = (field: Partial<ValuationInput>) => {
    setInput(prev => ({ ...prev, ...field }));
    setReady(false);
  };

  const toggleFeature = (f: string) => {
    const features = input.features ?? [];
    set({ features: features.includes(f) ? features.filter(x => x !== f) : [...features, f] });
  };

  const cityDistricts = DISTRICTS[input.city] ?? [];

  const fieldClass =
    "w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> AI Property Valuation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter property details to get an AI-powered market valuation and discount analysis.
          Free for all users — 2 valuations per account.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
        <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-primary" /> Property Details
        </h2>

        {/* Price & Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Asking Price ($)</label>
            <Input
              type="number"
              value={input.price}
              onChange={e => set({ price: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Area (m²)</label>
            <Input
              type="number"
              value={input.area}
              onChange={e => set({ area: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Bedrooms</label>
            <Input
              type="number"
              value={input.bedrooms}
              onChange={e => set({ bedrooms: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Bathrooms</label>
            <Input
              type="number"
              value={input.bathrooms}
              onChange={e => set({ bathrooms: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Property Age (years)</label>
            <Input
              type="number"
              value={input.age ?? 5}
              onChange={e => set({ age: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Property Type</label>
            <select
              value={input.propertyType}
              onChange={e => set({ propertyType: e.target.value })}
              className={fieldClass}
            >
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Location
          </label>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={input.city}
              onChange={e => set({ city: e.target.value, district: DISTRICTS[e.target.value]?.[0] ?? "" })}
              className={fieldClass}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={input.district}
              onChange={e => set({ district: e.target.value })}
              className={fieldClass}
            >
              {cityDistricts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block">Premium Features</label>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(f => {
              const selected = input.features?.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verified toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set({ verified: !input.verified })}
            className={`w-10 h-6 rounded-full transition-colors flex items-center ${
              input.verified ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${
              input.verified ? "translate-x-4" : "translate-x-0"
            }`} />
          </div>
          <span className="text-sm text-foreground font-medium">Platform-verified listing</span>
          <span className="text-xs text-muted-foreground">(+3% valuation premium)</span>
        </label>

        {/* Run button */}
        <button
          onClick={() => { setKey(k => k + 1); setReady(true); }}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Calculate AI Valuation
        </button>
      </div>

      {/* Result Widget */}
      {ready && (
        <AIValuationWidget key={key} input={input} />
      )}
    </div>
  );
}
