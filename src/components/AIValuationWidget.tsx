/**
 * AIValuationWidget
 * ─────────────────
 * Module 1: AI Valuation Engine — free for ALL users (all roles).
 * Each user gets 2 free valuations. Usage is tracked in localStorage
 * (keyed to the user's auth id so it's per-account on the device).
 *
 * Shows:
 *  • Verdict banner (Undervalued / Fair / Overvalued)
 *  • AI estimated value vs asking price
 *  • Discount vs market %
 *  • Price per m² vs market rate
 *  • 3-year appreciation forecast
 *  • Top 3 valuation factors
 *  • Comparables
 *
 * After 2 uses → upgrade prompt (Pro unlocks unlimited valuations).
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Sparkles, Lock, RefreshCw,
  ArrowUpRight, ArrowDownRight, CheckCircle2,
} from "lucide-react";
import { calculateValuation, ValuationInput, ValuationResult } from "@/services/valuationEngine";
import { useAuth } from "@/hooks/useAuth";

// ── Usage tracking ────────────────────────────────────────────────────────────

const FREE_USES = 2;

function getUsageKey(userId: string) {
  return `tv_valuation_uses_${userId}`;
}

function getUsageCount(userId: string): number {
  try {
    return parseInt(localStorage.getItem(getUsageKey(userId)) ?? "0", 10);
  } catch {
    return 0;
  }
}

function incrementUsage(userId: string): number {
  try {
    const next = getUsageCount(userId) + 1;
    localStorage.setItem(getUsageKey(userId), String(next));
    return next;
  } catch {
    return 1;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: ValuationResult["verdict"] }) {
  const cfg = {
    undervalued: {
      bg:   "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: <ArrowDownRight className="w-4 h-4" />,
      label: "🟢 Undervalued — Strong Buy Signal",
    },
    overvalued: {
      bg:   "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
      text: "text-red-700 dark:text-red-400",
      icon: <ArrowUpRight className="w-4 h-4" />,
      label: "🔴 Overvalued — Exercise Caution",
    },
    fair: {
      bg:   "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
      text: "text-amber-700 dark:text-amber-400",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "🟡 Fair Market Value",
    },
  }[verdict];

  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border ${cfg.bg}`}>
      <span className={cfg.text}>{cfg.icon}</span>
      <p className={`font-semibold text-sm ${cfg.text}`}>{cfg.label}</p>
    </div>
  );
}

function MetricTile({
  label, value, sub, highlight,
}: { label: string; value: string; sub?: string; highlight?: "positive" | "negative" | "neutral" }) {
  const color =
    highlight === "positive" ? "text-emerald-600 dark:text-emerald-400" :
    highlight === "negative" ? "text-red-600 dark:text-red-400" :
    "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────

interface Props {
  input: ValuationInput;
  /** Compact = show just verdict + key numbers (for property cards / list items) */
  compact?: boolean;
}

export default function AIValuationWidget({ input, compact = false }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id ?? "anonymous";
  const [usedCount, setUsedCount] = useState(() => getUsageCount(userId));
  const [result,    setResult]    = useState<ValuationResult | null>(null);
  const [revealed,  setReveal]    = useState(false);

  const remaining = Math.max(0, FREE_USES - usedCount);
  const isExhausted = usedCount >= FREE_USES && !revealed;

  const runValuation = useCallback(() => {
    if (usedCount >= FREE_USES) return; // guard — button shouldn't be visible
    const valuation = calculateValuation(input);
    const newCount = incrementUsage(userId);
    setUsedCount(newCount);
    setResult(valuation);
    setReveal(true);
  }, [input, userId, usedCount]);

  const reset = () => {
    setResult(null);
    setReveal(false);
  };

  // ── Not yet run ──────────────────────────────────────────────────────────
  if (!revealed && !isExhausted) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">AI Valuation</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700">
            FREE · {remaining} of {FREE_USES} uses left
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Run the AI valuation engine to see estimated market value, discount vs market,
          and a 3-year appreciation forecast for this property.
        </p>

        <button
          onClick={runValuation}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Run Free Valuation
        </button>
      </div>
    );
  }

  // ── Uses exhausted, not yet run this session ──────────────────────────────
  if (isExhausted) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">AI Valuation</h3>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            You've used your 2 free valuations
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Upgrade to Pro for unlimited AI valuations on every property.
          </p>
        </div>

        <div className="rounded-xl bg-secondary/40 p-3 space-y-1.5">
          {["Unlimited AI valuations", "Discount vs market analysis", "5-year appreciation forecast", "Comparable sales data"].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {f}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/pricing")}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Upgrade to Pro — Unlock Unlimited
        </button>
      </div>
    );
  }

  if (!result) return null;

  // ── Compact mode: just the headline numbers ───────────────────────────────
  if (compact) {
    const diffColor =
      result.discountPercent <= -5 ? "text-emerald-600 dark:text-emerald-400" :
      result.discountPercent >= 5  ? "text-red-600 dark:text-red-400" :
      "text-amber-600 dark:text-amber-400";

    return (
      <div className="rounded-xl border border-border p-3 bg-card space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Valuation</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{result.confidenceLabel} confidence</span>
        </div>
        <VerdictBadge verdict={result.verdict} />
        <div className="grid grid-cols-2 gap-2">
          <MetricTile label="AI Value" value={`$${result.estimatedValue.toLocaleString()}`} />
          <MetricTile
            label="vs Market"
            value={`${result.discountPercent > 0 ? "+" : ""}${result.discountPercent}%`}
            highlight={result.discountPercent <= -5 ? "positive" : result.discountPercent >= 5 ? "negative" : "neutral"}
          />
        </div>
      </div>
    );
  }

  // ── Full result ───────────────────────────────────────────────────────────
  const diffHighlight: "positive" | "negative" | "neutral" =
    result.discountPercent <= -5 ? "positive" :
    result.discountPercent >= 5  ? "negative" : "neutral";

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> AI Valuation Engine
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {result.confidenceLabel} confidence
          </span>
          {remaining > 0 && (
            <button
              onClick={reset}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
              title="Run again"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Verdict */}
      <VerdictBadge verdict={result.verdict} />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="AI Est. Value"  value={`$${result.estimatedValue.toLocaleString()}`} />
        <MetricTile
          label="vs Market"
          value={`${result.discountPercent > 0 ? "+" : ""}${result.discountPercent}%`}
          sub={result.discountPercent <= -5 ? "Below market — good buy" : result.discountPercent >= 5 ? "Above market" : "Fair value"}
          highlight={diffHighlight}
        />
        <MetricTile label="Price / m²"   value={`$${result.pricePerSqm}`} />
        <MetricTile label="Market / m²"  value={`$${result.marketPricePerSqm}`} />
      </div>

      {/* Appreciation Forecast */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Price Appreciation Forecast</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "1 Year",  val: result.appreciation.oneYear },
            { label: "3 Years", val: result.appreciation.threeYear },
            { label: "5 Years", val: result.appreciation.fiveYear },
          ].map(f => (
            <div key={f.label} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">{f.label}</p>
              <p className="text-sm font-bold text-primary mt-0.5">${(f.val / 1000).toFixed(0)}K</p>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Factors */}
      <div className="space-y-2 pt-1 border-t border-border">
        <p className="text-xs font-semibold text-foreground">Key Valuation Factors</p>
        {result.factors.slice(0, 3).map(f => (
          <div key={f.name} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
              f.impact === "positive" ? "bg-emerald-500" :
              f.impact === "negative" ? "bg-red-500" : "bg-amber-400"
            }`} />
            <span className="leading-relaxed">{f.description}</span>
          </div>
        ))}
      </div>

      {/* Comparables */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Comparable Properties</p>
        <div className="space-y-1.5">
          {result.comparables.map(c => (
            <div key={c.title} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-foreground">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.distance} · {c.similarity}% similar</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">${c.price.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">${c.pricePerSqm}/m²</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score breakdown by category */}
      {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border">
          <p className="text-xs font-semibold text-foreground">Property Score Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {result.scoreBreakdown.map(s => (
              <div key={s.category} className="rounded-xl bg-secondary/40 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[11px] text-muted-foreground">{s.category}</p>
                  <p className="text-xs font-bold text-foreground">{s.score}/{s.max}</p>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.score / s.max >= 0.7 ? "bg-emerald-500" : s.score / s.max >= 0.4 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${(s.score / s.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free uses reminder */}
      {remaining === 0 ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 text-center">
          This was your last free valuation.{" "}
          <button onClick={() => navigate("/pricing")} className="underline font-semibold">
            Upgrade to Pro
          </button>{" "}
          for unlimited.
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground text-center">
          {remaining} free valuation{remaining === 1 ? "" : "s"} remaining on this device.
        </p>
      )}
    </div>
  );
}
