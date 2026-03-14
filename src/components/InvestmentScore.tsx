/**
 * Investment Score Engine — Module 2
 * 5-factor deal scoring: price discount · rental yield · location growth · liquidity risk · developer reputation
 */
import React from "react";
import { TrendingUp, MapPin, DollarSign, AlertTriangle, Building2 } from "lucide-react";

export interface DealScoreInput {
  price: number;
  aiValuation: number;
  rentalYield?: number;
  city: string;
  district: string;
  propertyType: string;
  developerRating?: number;
  daysOnMarket?: number;
  verified?: boolean;
}

interface ScoreFactor {
  key: string;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
  icon: React.ElementType;
}

interface DealScore {
  total: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  label: string;
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Caution" | "Avoid";
  factors: ScoreFactor[];
  summary: string;
}

const CITY_GROWTH: Record<string, number> = { Erbil: 85, Baghdad: 62, Sulaymaniyah: 74, Basra: 52 };
const LIQUIDITY: Record<string, number> = { Apartment: 78, Villa: 65, Commercial: 55, Land: 40, Penthouse: 60, Townhouse: 70 };

export function calculateDealScore(input: DealScoreInput): DealScore {
  const { price, aiValuation, rentalYield = 6, city, district, propertyType, developerRating = 3.5, daysOnMarket = 30, verified = false } = input;

  const discountPct = ((aiValuation - price) / aiValuation) * 100;
  const discountScore = Math.min(100, Math.max(0, 50 + discountPct * 2));
  const yieldScore = Math.min(100, Math.max(0, ((rentalYield - 4) / 6) * 100));
  const growthScore = CITY_GROWTH[city] ?? 60;
  const liquidityScore = LIQUIDITY[propertyType] ?? 65;
  const developerScore = Math.min(100, Math.max(0, (developerRating / 5) * 100));

  const factors: ScoreFactor[] = [
    {
      key: "discount", label: "Price Discount", score: Math.round(discountScore), weight: 0.30,
      contribution: Math.round(discountScore * 0.30),
      description: discountPct > 5 ? `${discountPct.toFixed(1)}% below AI valuation — strong entry.` : discountPct < -5 ? `${Math.abs(discountPct).toFixed(1)}% above AI valuation — limited upside.` : `At fair market value (${discountPct.toFixed(1)}% vs AI).`,
      sentiment: discountPct > 5 ? "positive" : discountPct < -5 ? "negative" : "neutral",
      icon: DollarSign,
    },
    {
      key: "yield", label: "Rental Yield", score: Math.round(yieldScore), weight: 0.25,
      contribution: Math.round(yieldScore * 0.25),
      description: `${rentalYield.toFixed(1)}% annual yield — ${rentalYield >= 8 ? "excellent cash flow." : rentalYield >= 6 ? "solid income asset." : "below-average yield."}`,
      sentiment: rentalYield >= 8 ? "positive" : rentalYield >= 5 ? "neutral" : "negative",
      icon: TrendingUp,
    },
    {
      key: "growth", label: "Location Growth", score: Math.round(growthScore), weight: 0.20,
      contribution: Math.round(growthScore * 0.20),
      description: `${city} shows ${growthScore >= 75 ? "strong" : growthScore >= 55 ? "moderate" : "limited"} appreciation potential.`,
      sentiment: growthScore >= 70 ? "positive" : growthScore >= 50 ? "neutral" : "negative",
      icon: MapPin,
    },
    {
      key: "liquidity", label: "Liquidity Risk", score: Math.round(liquidityScore), weight: 0.15,
      contribution: Math.round(liquidityScore * 0.15),
      description: `${propertyType} has ${liquidityScore >= 70 ? "high" : liquidityScore >= 55 ? "moderate" : "low"} market liquidity.${daysOnMarket > 90 ? " Extended days-on-market noted." : ""}`,
      sentiment: liquidityScore >= 70 ? "positive" : liquidityScore >= 50 ? "neutral" : "negative",
      icon: AlertTriangle,
    },
    {
      key: "developer", label: "Developer Rep.", score: Math.round(developerScore), weight: 0.10,
      contribution: Math.round(developerScore * 0.10),
      description: `Rated ${developerRating}/5 — ${developerRating >= 4 ? "strong track record." : developerRating >= 3 ? "acceptable history." : "delivery risk elevated."}${verified ? " ✓ Verified." : ""}`,
      sentiment: developerRating >= 4 ? "positive" : developerRating >= 3 ? "neutral" : "negative",
      icon: Building2,
    },
  ];

  const total = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const grade: DealScore["grade"] = total >= 90 ? "A+" : total >= 80 ? "A" : total >= 70 ? "B+" : total >= 60 ? "B" : total >= 45 ? "C" : "D";
  const recommendation: DealScore["recommendation"] = total >= 80 ? "Strong Buy" : total >= 65 ? "Buy" : total >= 50 ? "Hold" : total >= 35 ? "Caution" : "Avoid";
  const label = total >= 80 ? "Exceptional Deal" : total >= 65 ? "Good Investment" : total >= 50 ? "Average" : total >= 35 ? "Below Average" : "Poor Deal";
  const positives = factors.filter(f => f.sentiment === "positive").map(f => f.label).join(", ");
  const negatives = factors.filter(f => f.sentiment === "negative").map(f => f.label).join(", ");
  const summary = `Score ${total}/100 — ${label}. ${recommendation === "Strong Buy" || recommendation === "Buy" ? `Strengths: ${positives || "fair value"}.` : `Risks: ${negatives || "none critical"}.`}`;

  return { total, grade, label, recommendation, factors, summary };
}

interface Props { input: DealScoreInput; compact?: boolean; }

export default function InvestmentScore({ input, compact = false }: Props) {
  const result = calculateDealScore(input);

  const gradeStyle: Record<string, { ring: string; bg: string; text: string }> = {
    "A+": { ring: "border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" },
    "A":  { ring: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
    "B+": { ring: "border-primary",     bg: "bg-primary/5",                         text: "text-primary" },
    "B":  { ring: "border-primary/70",  bg: "bg-primary/5",                         text: "text-primary" },
    "C":  { ring: "border-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400" },
    "D":  { ring: "border-red-500",     bg: "bg-red-50 dark:bg-red-900/20",         text: "text-red-700 dark:text-red-400" },
  };
  const recStyle: Record<string, string> = {
    "Strong Buy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    "Buy":        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    "Hold":       "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    "Caution":    "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    "Avoid":      "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };
  const gs = gradeStyle[result.grade] ?? gradeStyle["B"];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${gs.ring} ${gs.bg}`}>
          <span className={`text-base font-black leading-none ${gs.text}`}>{result.total}</span>
          <span className={`text-[9px] font-bold ${gs.text}`}>{result.grade}</span>
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">{result.label}</p>
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${recStyle[result.recommendation] ?? ""}`}>
            {result.recommendation}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-2xl border-4 flex flex-col items-center justify-center shrink-0 ${gs.ring} ${gs.bg}`}>
          <span className={`text-2xl font-black leading-none ${gs.text}`}>{result.total}</span>
          <span className={`text-[10px] font-bold ${gs.text}`}>{result.grade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-foreground">{result.label}</span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${recStyle[result.recommendation] ?? ""}`}>
              {result.recommendation}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">Score Factors</p>
        {result.factors.map((f) => {
          const Icon = f.icon;
          const barColor = f.sentiment === "positive" ? "bg-emerald-500" : f.sentiment === "negative" ? "bg-red-500" : "bg-amber-400";
          const scoreColor = f.sentiment === "positive" ? "text-emerald-600 dark:text-emerald-400" : f.sentiment === "negative" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {f.label}
                  <span className="text-[10px] text-muted-foreground">({Math.round(f.weight * 100)}%)</span>
                </span>
                <span className={`text-xs font-bold ${scoreColor}`}>{f.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${f.score}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{f.description}</p>
            </div>
          );
        })}
      </div>

      {/* Contribution summary */}
      <div className="rounded-xl bg-secondary/40 p-3">
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Weighted Contributions</p>
        <div className="grid grid-cols-5 gap-1">
          {result.factors.map((f) => {
            const c = f.sentiment === "positive" ? "text-emerald-600 dark:text-emerald-400" : f.sentiment === "negative" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
            return (
              <div key={f.key} className="text-center">
                <p className={`text-sm font-bold ${c}`}>{f.contribution}</p>
                <p className="text-[9px] text-muted-foreground">{f.label.split(" ")[0]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
