/**
 * Investor Intelligence — InvestorTools page
 * Three Elite-gated tabs:
 *   1. Predictive Engine  — 6-factor investment score with 10-year projections
 *   2. Smart Deals        — AI deal discovery with filters
 *   3. Portfolio          — holdings table + market comparison
 * Plus a free Mortgage Calculator accessible to all.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Brain, DollarSign, TrendingUp, BarChart3, AlertTriangle, Calculator,
  Sparkles, Zap, Shield, Target, Flame, ArrowUpRight, ArrowDownRight,
  Clock, BadgeCheck, MapPin, Filter, Globe, Search,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import PlanGate from "@/components/PlanGate";
import { calculateInvestmentPrediction, type InvestmentInput } from "@/services/investmentEngine";
import { ALL_DEALS, type DealResult, type DealType } from "@/services/dealDiscovery";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

const IMG_MAP: Record<string, string> = { "property-1": property1, "property-2": property2, "property-3": property3, "property-4": property4 };
const riskColors: Record<string, string> = {
  Low: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
  Medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  High: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
  "Very High": "text-destructive bg-destructive/10",
};
const dealTypeColors: Record<DealType, string> = {
  "Undervalued":        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Distressed Sale":    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Developer Discount": "bg-primary/10 text-primary",
  "Motivated Seller":   "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "High-Yield":         "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Off-Market Signal":  "bg-secondary text-secondary-foreground",
};

// ─────────────────────────────────────────────────────────────────────────────
// Mortgage Calculator (free)
// ─────────────────────────────────────────────────────────────────────────────

function MortgageCalculator() {
  const [price, setPrice] = useState(300000);
  const [down, setDown]   = useState(20);
  const [rate, setRate]   = useState(7.5);
  const [years, setYears] = useState(20);
  const loan     = price * (1 - down / 100);
  const mr       = rate / 100 / 12;
  const n        = years * 12;
  const monthly  = mr > 0 ? (loan * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : loan / n;
  const interest = monthly * n - loan;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" /> Mortgage Calculator
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Property Price ($)",  val: price, set: setPrice,  step: 5000  },
          { label: "Down Payment (%)",    val: down,  set: setDown,   step: 5     },
          { label: "Interest Rate (%)",   val: rate,  set: setRate,   step: 0.25  },
          { label: "Loan Term (Years)",   val: years, set: setYears,  step: 5     },
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs text-muted-foreground">{f.label}</label>
            <Input type="number" value={f.val} step={f.step} onChange={e => f.set(Number(e.target.value))} className="mt-1" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Monthly</p>
          <p className="text-xl font-bold text-primary">${monthly.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Interest</p>
          <p className="text-xl font-bold text-success">${(interest / 1000).toFixed(0)}K</p>
        </div>
        <div className="rounded-xl bg-warning/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Loan Amount</p>
          <p className="text-xl font-bold text-warning">${(loan / 1000).toFixed(0)}K</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Predictive Investment Engine Tab
// ─────────────────────────────────────────────────────────────────────────────

const INP_DEFAULTS: InvestmentInput = {
  price: 285000, aiValuation: 342000, area: 380, city: "Erbil", district: "Ankawa",
  propertyType: "Villa", age: 4, verified: true, rentalYield: 8.1,
  nearbyFacilities: ["school", "mall", "park"],
  daysOnMarket: 12, developerRating: 4.5, similarSoldCount: 9,
};

const CITIES    = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah"];
const DISTRICTS: Record<string, string[]> = {
  Erbil: ["Ankawa", "Gulan", "Ainkawa", "Shorsh", "Sarchinar"],
  Baghdad: ["Mansour", "Karrada", "Jadriya", "Zayouna", "Adhamiya"],
  Basra: ["Ashar", "Corniche", "Brazilja"],
  Sulaymaniyah: ["Bakhtiari", "Qadisiyah", "Salim Street"],
};
const FACILITIES = ["school", "hospital", "mall", "park", "university", "metro", "mosque"];

function PredictiveEngineTab() {
  const [inp, setInp] = useState<InvestmentInput>(INP_DEFAULTS);
  const [result, setResult] = useState(() => calculateInvestmentPrediction(INP_DEFAULTS));
  const [showForm, setShowForm] = useState(false);

  const rerun = () => setResult(calculateInvestmentPrediction(inp));
  const set = (p: Partial<InvestmentInput>) => setInp(prev => ({ ...prev, ...p }));
  const toggleFac = (f: string) => {
    const arr = inp.nearbyFacilities ?? [];
    set({ nearbyFacilities: arr.includes(f) ? arr.filter(x => x !== f) : [...arr, f] });
  };

  const gradeColor: Record<string, string> = {
    "A+": "text-emerald-600 dark:text-emerald-400 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    "A":  "text-emerald-600 dark:text-emerald-400 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    "B+": "text-primary border-primary bg-primary/5",
    "B":  "text-primary border-primary/70 bg-primary/5",
    "C":  "text-amber-600 border-amber-400 bg-amber-50 dark:bg-amber-900/20",
    "D":  "text-destructive border-destructive bg-destructive/5",
  };
  const recColors: Record<string, string> = {
    "Strong Buy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    "Buy":        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    "Hold":       "bg-amber-50 text-amber-700",
    "Caution":    "bg-orange-50 text-orange-700",
    "Avoid":      "bg-destructive/10 text-destructive",
  };
  const gs = gradeColor[result.grade] ?? gradeColor["B"];

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Big score ring */}
          <div className={`w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center shrink-0 ${gs}`}>
            <span className="text-3xl font-black leading-none">{result.score}</span>
            <span className="text-sm font-bold">{result.grade}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xl font-bold text-foreground">{result.label}</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${recColors[result.recommendation] ?? ""}`}>
                {result.recommendation}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${riskColors[result.riskLevel]}`}>
                {result.riskLevel} Risk
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.thesis}</p>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border">
          {[
            { label: "5-Yr Price Gain",    value: `+${result.priceAppreciation.y5}%`,      color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Annualised Return",  value: `${result.annualizedReturnY5}%/yr`,        color: "text-primary" },
            { label: "Current Yield",      value: `${result.rentalYieldCurrent}%`,           color: "text-foreground" },
            { label: "Confidence Range",   value: `${result.confidenceInterval.low}–${result.confidenceInterval.high}%`, color: "text-muted-foreground" },
          ].map(m => (
            <div key={m.label} className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Price appreciation forecast */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-foreground mb-2">Price Appreciation Forecast</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "1 Year",  val: result.priceAppreciation.y1 },
              { label: "3 Years", val: result.priceAppreciation.y3 },
              { label: "5 Years", val: result.priceAppreciation.y5 },
              { label: "10 Yrs",  val: result.priceAppreciation.y10 },
            ].map(f => (
              <div key={f.label} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <p className="text-[11px] text-muted-foreground">{f.label}</p>
                <p className="text-sm font-bold text-primary mt-0.5">+{f.val}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Factor bars */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <p className="font-semibold text-foreground text-sm">6-Factor Investment Analysis</p>
        {result.factors.map(f => {
          const barColor = f.trend === "rising" ? "bg-emerald-500" : f.trend === "declining" ? "bg-red-500" : "bg-amber-400";
          const scoreColor = f.trend === "rising" ? "text-emerald-600 dark:text-emerald-400" : f.trend === "declining" ? "text-destructive" : "text-amber-600";
          const TrendIcon = f.trend === "rising" ? ArrowUpRight : f.trend === "declining" ? ArrowDownRight : Zap;
          return (
            <div key={f.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <TrendIcon className={`w-3.5 h-3.5 ${scoreColor}`} />
                  {f.label}
                  <span className="text-[10px] text-muted-foreground font-normal">({Math.round(f.weight * 100)}%)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${scoreColor}`}>{f.score}/100</span>
                  <span className="text-[10px] text-muted-foreground">→ {f.contribution}pts</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${f.score}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">{f.headline}</p>
              <div className="space-y-0.5 ps-3">
                {f.bullets.map((b, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />{b}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 10-Year projection table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-foreground text-sm">10-Year Cash Flow Projection</p>
          <span className="text-xs text-muted-foreground">Based on {inp.city} market assumptions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/20 border-b border-border">
                {["Year", "Property Value", "Annual Rent", "Cumul. ROI", "Cash Flow"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.projections.map(p => (
                <tr key={p.year} className={`border-b border-border last:border-0 hover:bg-secondary/10 ${[3, 5, 10].includes(p.year) ? "bg-primary/3" : ""}`}>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{p.year}yr{[3, 5, 10].includes(p.year) ? " ★" : ""}</td>
                  <td className="px-4 py-2.5 text-foreground">${(p.priceValue / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-2.5 text-foreground">${(p.rentalIncome / 1000).toFixed(0)}K</td>
                  <td className={`px-4 py-2.5 font-semibold ${p.cumulativeROI >= 20 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>+{p.cumulativeROI}%</td>
                  <td className={`px-4 py-2.5 font-medium ${p.cashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {p.cashFlow >= 0 ? "+" : ""}${(p.cashFlow / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalysts & Risks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">🚀 Upside Catalysts</p>
          {result.catalysts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />{c}
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 p-4 space-y-2">
          <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wide">⚠️ Key Risks</p>
          {result.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{r}
            </div>
          ))}
        </div>
      </div>

      {/* Input form toggle */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <button onClick={() => setShowForm(!showForm)} className="w-full flex items-center justify-between text-sm font-semibold text-foreground">
          <span className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Analyse a Different Property</span>
          <span className="text-xs text-primary">{showForm ? "Hide" : "Customise inputs →"}</span>
        </button>
        {showForm && (
          <div className="mt-4 space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Asking Price ($)</label><Input type="number" value={inp.price} onChange={e => set({ price: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">AI Valuation ($)</label><Input type="number" value={inp.aiValuation} onChange={e => set({ aiValuation: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Area (m²)</label><Input type="number" value={inp.area} onChange={e => set({ area: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Rental Yield (%)</label><Input type="number" step="0.1" value={inp.rentalYield ?? 7} onChange={e => set({ rentalYield: +e.target.value })} /></div>
              <div>
                <label className="text-xs text-muted-foreground">City</label>
                <select value={inp.city} onChange={e => set({ city: e.target.value, district: DISTRICTS[e.target.value]?.[0] ?? "" })} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm mt-0.5">
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">District</label>
                <select value={inp.district} onChange={e => set({ district: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm mt-0.5">
                  {(DISTRICTS[inp.city] ?? []).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Nearby Facilities</label>
              <div className="flex flex-wrap gap-1.5">
                {FACILITIES.map(f => {
                  const sel = inp.nearbyFacilities?.includes(f);
                  return (
                    <button key={f} onClick={() => toggleFac(f)} className={`px-2.5 py-1 rounded-lg text-xs border capitalize transition-all ${sel ? "bg-primary text-white border-primary" : "bg-secondary border-border"}`}>{f}</button>
                  );
                })}
              </div>
            </div>
            <Button onClick={rerun} className="bg-primary text-white rounded-xl"><Sparkles className="w-4 h-4 me-2" /> Re-analyse</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Deal Discovery Tab
// ─────────────────────────────────────────────────────────────────────────────

const DEAL_TYPES: (DealType | "All")[] = ["All", "Undervalued", "Distressed Sale", "Developer Discount", "Motivated Seller", "High-Yield"];
const RISK_FILTERS = ["All", "Low", "Medium", "High", "Very High"];

function ScoreRing({ score, grade, color }: { score: number; grade: string; color: string }) {
  return (
    <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${color}`}>
      <span className="text-lg font-black leading-none">{score}</span>
      <span className="text-[10px] font-bold">{grade}</span>
    </div>
  );
}

function DealCard({ deal }: { deal: DealResult }) {
  const navigate = useNavigate();
  const img = IMG_MAP[deal.image ?? "property-1"] ?? property1;
  const urgencyColor = deal.urgency === "Act Now" ? "bg-red-500" : deal.urgency === "Monitor" ? "bg-amber-500" : "bg-secondary";
  const gradeColorMap: Record<string, string> = {
    "A+": "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    "A":  "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    "B+": "border-primary bg-primary/5 text-primary",
    "B":  "border-primary/60 bg-primary/5 text-primary",
    "C":  "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    "D":  "border-destructive bg-destructive/5 text-destructive",
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="relative">
        <img src={img} alt={deal.title} className="w-full h-36 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Urgency pill */}
        <div className={`absolute top-2 start-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${urgencyColor}`}>
          {deal.urgency === "Act Now" ? "🔥 Act Now" : deal.urgency === "Monitor" ? "👁 Monitor" : "Low Priority"}
        </div>

        {/* Deal score ring */}
        <div className="absolute top-2 end-2">
          <ScoreRing score={deal.dealScore} grade={deal.dealGrade} color={gradeColorMap[deal.dealGrade] ?? gradeColorMap["B"]} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-foreground text-sm leading-tight">{deal.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{deal.district}, {deal.city}
          </p>
        </div>

        {/* Deal type badges */}
        <div className="flex flex-wrap gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${dealTypeColors[deal.primaryDealType] ?? ""}`}>
            {deal.primaryDealType}
          </span>
          {deal.signals.length > 1 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
              +{deal.signals.length - 1} signal{deal.signals.length > 2 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">ROI (3yr)</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{deal.expectedROI}%</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Yield</p>
            <p className="text-sm font-bold text-foreground">{deal.rentalYield}%</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Vs Market</p>
            <p className={`text-sm font-bold ${deal.discountToMarket >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {deal.discountToMarket >= 0 ? "-" : "+"}{Math.abs(deal.discountToMarket)}%
            </p>
          </div>
        </div>

        {/* Risk */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${riskColors[deal.riskLevel] ?? ""}`}>
            {deal.riskLevel} Risk
          </span>
          <span className="text-[10px] text-muted-foreground">{deal.timeHorizon}</span>
        </div>

        {/* Deal thesis */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-2">{deal.dealThesis}</p>

        {/* Signals */}
        {deal.signals.length > 0 && (
          <div className="space-y-1">
            {deal.signals.slice(0, 2).map((s, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${s.strength === "Strong" ? "bg-emerald-500" : s.strength === "Moderate" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                {s.description}
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <p className="text-base font-bold text-foreground">${deal.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">AI val: ${deal.aiValuation.toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate(`/property/${deal.id}`)}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
}

function SmartDealsTab() {
  const [typeFilter, setTypeFilter]   = useState<DealType | "All">("All");
  const [riskFilter, setRiskFilter]   = useState("All");
  const [cityFilter, setCityFilter]   = useState("All");
  const [minScore, setMinScore]       = useState(0);
  const [searchQ, setSearchQ]         = useState("");
  const [sortBy, setSortBy]           = useState<"score" | "roi" | "yield" | "discount">("score");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = ALL_DEALS
    .filter(d => typeFilter === "All" || d.primaryDealType === typeFilter)
    .filter(d => riskFilter === "All" || d.riskLevel === riskFilter)
    .filter(d => cityFilter === "All" || d.city === cityFilter)
    .filter(d => d.dealScore >= minScore)
    .filter(d => !searchQ || d.title.toLowerCase().includes(searchQ.toLowerCase()) || d.district.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "roi")      return b.expectedROI - a.expectedROI;
      if (sortBy === "yield")    return b.rentalYield - a.rentalYield;
      if (sortBy === "discount") return b.discountToMarket - a.discountToMarket;
      return b.dealScore - a.dealScore;
    });

  const topDeal = filtered[0];

  return (
    <div className="space-y-5">
      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">Deals Scanned</p>
          <p className="text-2xl font-bold text-foreground">{ALL_DEALS.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">AI-scored listings</p>
        </div>
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">Top Deal Score</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{topDeal?.dealScore ?? 0}/100</p>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500 mt-0.5">{topDeal?.city}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">Avg Expected ROI</p>
          <p className="text-2xl font-bold text-primary">{Math.round(ALL_DEALS.reduce((s, d) => s + d.expectedROI, 0) / ALL_DEALS.length)}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">3-year total</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">"Act Now" Deals</p>
          <p className="text-2xl font-bold text-red-600">{ALL_DEALS.filter(d => d.urgency === "Act Now").length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">High urgency</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search deals…"
              className="w-full h-9 rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full h-9 rounded-xl border border-border bg-background px-2 text-xs">
                <option value="score">Deal Score</option>
                <option value="roi">Expected ROI</option>
                <option value="yield">Rental Yield</option>
                <option value="discount">Discount %</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">City</label>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full h-9 rounded-xl border border-border bg-background px-2 text-xs">
                {["All", ...CITIES].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">Risk Level</label>
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="w-full h-9 rounded-xl border border-border bg-background px-2 text-xs">
                {RISK_FILTERS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">Min Score: {minScore}</label>
              <input type="range" min={0} max={90} step={5} value={minScore} onChange={e => setMinScore(+e.target.value)}
                className="w-full h-2 mt-3 accent-primary" />
            </div>
          </div>
        )}

        {/* Deal type chips */}
        <div className="flex gap-1.5 flex-wrap">
          {DEAL_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${typeFilter === t ? "bg-primary text-white border-primary" : "bg-secondary/40 border-border text-foreground hover:border-primary/40"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{filtered.length}</span> deal{filtered.length !== 1 ? "s" : ""} found
        {filtered.length < ALL_DEALS.length && ` (filtered from ${ALL_DEALS.length})`}
      </p>

      {/* Deal cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-card border border-border">
          <Search className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">No deals match your filters</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try loosening the score threshold or removing filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => <DealCard key={d.id} deal={d} />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Tab (existing data)
// ─────────────────────────────────────────────────────────────────────────────

const portfolioItems = [
  { name: "Erbil Villa Portfolio",      value: 1240000, roi: 12.4, irr: 8.2,  risk: "low"    },
  { name: "Baghdad Commercial",          value: 890000,  roi: 9.1,  irr: 6.8,  risk: "medium" },
  { name: "Basra Residential Block",     value: 560000,  roi: 15.3, irr: 11.1, risk: "medium" },
  { name: "Sulaymaniyah Mixed-Use",      value: 340000,  roi: 7.8,  irr: 5.4,  risk: "high"   },
] as const;

const marketCompare = [
  { city: "Baghdad",       avgPrice: 1850, growth: 4.2, demand: "High",       peRatio: 18.5, volatility: "Medium", esg: 62 },
  { city: "Erbil",         avgPrice: 2200, growth: 7.8, demand: "Very High",  peRatio: 15.2, volatility: "Low",    esg: 71 },
  { city: "Basra",         avgPrice: 1400, growth: 3.1, demand: "Medium",     peRatio: 22.1, volatility: "High",   esg: 55 },
  { city: "Sulaymaniyah",  avgPrice: 1650, growth: 5.5, demand: "High",       peRatio: 19.8, volatility: "Medium", esg: 67 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function InvestorTools() {
  const { t } = useTranslation();
  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const avgROI     = (portfolioItems.reduce((s, i) => s + i.roi, 0) / portfolioItems.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Investor Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predictive investment scoring, smart deal discovery, and portfolio analytics.
        </p>
      </div>

      {/* Free mortgage calculator */}
      <MortgageCalculator />

      {/* Elite-gated tools */}
      <PlanGate requiredTier="elite" featureLabel="Investor Portfolio Tools">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Portfolio Value" value={`$${(totalValue / 1e6).toFixed(1)}M`} change="+8.3% YoY" icon={DollarSign} trend="up" />
            <StatsCard title="Avg ROI"         value={`${avgROI}%`}    change="+1.2%"    icon={TrendingUp}   trend="up" />
            <StatsCard title="Properties"      value={portfolioItems.length}               icon={BarChart3} />
            <StatsCard title="Deals Available" value={ALL_DEALS.filter(d => d.dealScore >= 70).length} change="70+ score" icon={Target} trend="up" />
          </div>

          <Tabs defaultValue="prediction">
            <TabsList className="bg-secondary rounded-xl p-1 h-auto flex-wrap gap-1">
              <TabsTrigger value="prediction" className="rounded-lg text-xs gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Predictive Engine
              </TabsTrigger>
              <TabsTrigger value="deals" className="rounded-lg text-xs gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Smart Deals
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-lg text-xs gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Portfolio
              </TabsTrigger>
              <TabsTrigger value="market" className="rounded-lg text-xs gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Market Intel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prediction"><PredictiveEngineTab /></TabsContent>
            <TabsContent value="deals"><SmartDealsTab /></TabsContent>

            <TabsContent value="portfolio">
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Portfolio Holdings</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20">
                        {["Asset", "Value", "ROI", "IRR", "Risk"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioItems.map(item => (
                        <tr key={item.name} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-4 py-3">${item.value.toLocaleString()}</td>
                          <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{item.roi}%</td>
                          <td className="px-4 py-3">{item.irr}%</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${riskColors[item.risk.charAt(0).toUpperCase() + item.risk.slice(1)] ?? ""}`}>{item.risk}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="market">
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Multi-Market Intelligence</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20">
                        {["City", "Avg $/m²", "Growth", "P/E", "Volatility", "ESG", "Demand"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marketCompare.map(m => (
                        <tr key={m.city} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground">{m.city}</td>
                          <td className="px-4 py-3">${m.avgPrice}</td>
                          <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">+{m.growth}%</td>
                          <td className="px-4 py-3">{m.peRatio}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.volatility === "Low" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : m.volatility === "Medium" ? "bg-amber-50 text-amber-700" : "bg-destructive/10 text-destructive"}`}>
                              {m.volatility}
                            </span>
                          </td>
                          <td className="px-4 py-3">{m.esg}/100</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.demand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PlanGate>
    </div>
  );
}
