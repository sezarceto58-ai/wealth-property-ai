/**
 * AIValuationWidget — Confirmation-Gated Valuation
 *
 * Enforces strict rules:
 * 1. Valuation only activates when BOTH conditions are met:
 *    - A specific property has been identified (passed in via `property` prop)
 *    - The user has explicitly confirmed they want a valuation for THAT property
 * 2. Never auto-runs — always requires explicit user confirmation
 * 3. Confirmation screen names the exact property before proceeding
 * 4. Each widget instance is fully isolated — no cross-property data bleed
 * 5. Switching properties (different `property.id`) resets all state
 * 6. If no property is provided, blocks the valuation and explains why
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Sparkles, Lock, RefreshCw,
  ArrowUpRight, ArrowDownRight, CheckCircle2,
  Building2, AlertCircle, MapPin, Bed, Bath, Maximize,
} from "lucide-react";
import { calculateValuation, type ValuationInput, type ValuationResult } from "@/services/valuationEngine";
import { useAuth } from "@/hooks/useAuth";
import type { DbProperty } from "@/types/database";

// ── Usage tracking (per user, per device) ─────────────────────────────────────

const FREE_USES = 2;

function getUsageKey(userId: string) { return `aqar_valuation_uses_${userId}`; }
function getUsageCount(userId: string): number {
  try { return parseInt(localStorage.getItem(getUsageKey(userId)) ?? "0", 10); } catch { return 0; }
}
function incrementUsage(userId: string): number {
  try {
    const next = getUsageCount(userId) + 1;
    localStorage.setItem(getUsageKey(userId), String(next));
    return next;
  } catch { return 1; }
}

// ── Per-valuation submission lock (persists across page refreshes) ──────────
// Keyed by user + property id + listing price so that refreshing the page
// cannot trigger a second confirm for the same valuation snapshot. If the
// listing price changes later, a fresh valuation is allowed.
function getSubmissionKey(userId: string, propertyId: string, price: number) {
  return `aqar_valuation_submitted_${userId}_${propertyId}_${price}`;
}
function isAlreadySubmitted(userId: string, propertyId: string, price: number): boolean {
  try { return localStorage.getItem(getSubmissionKey(userId, propertyId, price)) !== null; } catch { return false; }
}
function markSubmitted(userId: string, propertyId: string, price: number, payload: ValuationResult) {
  try {
    localStorage.setItem(
      getSubmissionKey(userId, propertyId, price),
      JSON.stringify({ at: Date.now(), result: payload }),
    );
  } catch { /* ignore quota errors */ }
}
function getSubmittedResult(userId: string, propertyId: string, price: number): ValuationResult | null {
  try {
    const raw = localStorage.getItem(getSubmissionKey(userId, propertyId, price));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.result ?? null;
  } catch { return null; }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: ValuationResult["verdict"] }) {
  const cfg = {
    undervalued: {
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: <ArrowDownRight className="w-4 h-4" />,
      label: "🟢 Undervalued — Strong Buy Signal",
    },
    overvalued: {
      bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
      text: "text-red-700 dark:text-red-400",
      icon: <ArrowUpRight className="w-4 h-4" />,
      label: "🔴 Overvalued — Exercise Caution",
    },
    fair: {
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
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

function MetricTile({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string;
  highlight?: "positive" | "negative" | "neutral";
}) {
  const color =
    highlight === "positive" ? "text-emerald-600 dark:text-emerald-400" :
    highlight === "negative" ? "text-red-600 dark:text-red-400" : "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Stage types ────────────────────────────────────────────────────────────────

type Stage =
  | "no_property"   // Rule 1: no property identified — block
  | "idle"          // Property identified, awaiting explicit user request
  | "confirm"       // Rule 3: show confirmation screen naming the exact property
  | "exhausted"     // Usage limit reached
  | "result";       // Valuation completed and shown

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  /**
   * The specific property this widget is scoped to.
   * REQUIRED for valuation — if undefined, widget enters "no_property" stage.
   */
  property?: DbProperty;
  /**
   * Derived input already mapped from the property.
   * Still requires `property` to be set for identity checks.
   */
  input?: ValuationInput;
  /** Compact display mode for embedding in cards */
  compact?: boolean;
}

// ── Main Widget ────────────────────────────────────────────────────────────────

export default function AIValuationWidget({ property, input, compact = false }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id ?? "anonymous";
  const [usedCount, setUsedCount]   = useState(() => getUsageCount(userId));
  const [result, setResult]         = useState<ValuationResult | null>(() => {
    if (!property) return null;
    return getSubmittedResult(userId, property.id, property.price);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [stage, setStage]           = useState<Stage>(() => {
    if (!property) return "no_property";
    if (isAlreadySubmitted(userId, property.id, property.price)) return "result";
    if (getUsageCount(userId) >= FREE_USES) return "exhausted";
    return "idle";
  });

  // ── Rule 5: switching properties resets ALL state ──────────────────────────
  const lastPropertyId = useRef<string | undefined>(property?.id);
  useEffect(() => {
    if (property?.id !== lastPropertyId.current) {
      lastPropertyId.current = property?.id;
      setUsedCount(getUsageCount(userId));
      if (!property) {
        setResult(null);
        setStage("no_property");
        return;
      }
      const prior = getSubmittedResult(userId, property.id, property.price);
      if (prior) {
        setResult(prior);
        setStage("result");
      } else if (getUsageCount(userId) >= FREE_USES) {
        setResult(null);
        setStage("exhausted");
      } else {
        setResult(null);
        setStage("idle");    // reset to idle — must re-confirm for new property
      }
    }
  }, [property?.id, property?.price, userId]);

  // ── Rule 2+3: user clicks "Request Valuation" → go to confirm screen ───────
  const handleRequestValuation = () => {
    if (!property) { setStage("no_property"); return; }
    if (isAlreadySubmitted(userId, property.id, property.price)) {
      const prior = getSubmittedResult(userId, property.id, property.price);
      if (prior) { setResult(prior); setStage("result"); return; }
    }
    if (usedCount >= FREE_USES) { setStage("exhausted"); return; }
    setStage("confirm");   // show confirmation screen naming the property
  };

  // ── Rule 3: user confirms the exact property → run valuation ───────────────
  const handleConfirm = useCallback(() => {
    if (submitLockRef.current) return;          // hard lock against double-clicks
    if (!property || !input) return;
    // Persistent lock: refreshing won't allow another confirm for same snapshot
    const prior = getSubmittedResult(userId, property.id, property.price);
    if (prior) {
      setResult(prior);
      setStage("result");
      return;
    }
    if (usedCount >= FREE_USES) { setStage("exhausted"); return; }
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const valuation = calculateValuation(input);
      const newCount = incrementUsage(userId);
      markSubmitted(userId, property.id, property.price, valuation);
      setUsedCount(newCount);
      setResult(valuation);
      setStage("result");
    } finally {
      setIsSubmitting(false);
      // release lock on next tick so a fresh confirm (after reset) works
      setTimeout(() => { submitLockRef.current = false; }, 0);
    }
  }, [property, input, userId, usedCount]);

  // ── Rule 3: user denies → back to idle ─────────────────────────────────────
  const handleDeny = () => setStage("idle");

  // ── Reset within same property ─────────────────────────────────────────────
  const handleReset = () => {
    if (!property) { setStage("no_property"); return; }
    // If already submitted for this snapshot, keep showing the persisted result
    const prior = getSubmittedResult(userId, property.id, property.price);
    if (prior) { setResult(prior); setStage("result"); return; }
    if (usedCount >= FREE_USES) { setStage("exhausted"); return; }
    setResult(null);
    setStage("idle");
  };

  const remaining = Math.max(0, FREE_USES - usedCount);

  // ────────────────────────────────────────────────────────────────────────────
  // STAGE: no_property — Rule 1 & 4: no property = no valuation
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === "no_property") {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">AI Property Valuation</h3>
        </div>
        <div className="rounded-xl bg-secondary/40 border border-border px-4 py-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Valuation is available on a per-property basis. To use this feature,
            first select a specific property from the marketplace, then request
            a valuation from its listing page.
          </p>
        </div>
        <button
          onClick={() => navigate("/buyer/discover")}
          className="w-full py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          Browse Properties →
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STAGE: exhausted — usage limit reached
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === "exhausted") {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">AI Valuation</h3>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            You've used your {FREE_USES} free valuations
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Upgrade to Pro for unlimited AI valuations on any property.
          </p>
        </div>
        {["Unlimited AI valuations", "Discount vs market analysis", "5-year appreciation forecast", "Comparable sales data"].map(f => (
          <div key={f} className="flex items-center gap-2 text-xs text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />{f}
          </div>
        ))}
        <button
          onClick={() => navigate("/pricing")}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Upgrade to Pro
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STAGE: idle — property identified, awaiting explicit user request
  // Rule 2: never auto-run; Rule 4: no demo or simulation
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === "idle") {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">AI Valuation</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700">
            FREE · {remaining} of {FREE_USES} uses left
          </span>
        </div>

        {/* Show the property this will be scoped to */}
        {property && (
          <div className="rounded-xl bg-secondary/30 border border-border px-4 py-3 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">This valuation is scoped to:</p>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">{property.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />{property.district}, {property.city}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Run the AI engine to see estimated market value, discount analysis,
          and a 3-year appreciation forecast for this specific property.
        </p>

        <button
          onClick={handleRequestValuation}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Request Valuation for This Property
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STAGE: confirm — Rule 3: name the exact property before proceeding
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === "confirm" && property) {
    const image = property.property_images?.[0]?.url;
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Confirm Valuation Request</h3>
        </div>

        {/* Rule 3: explicitly name the property */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-sm text-foreground font-medium">
            You're requesting a valuation for:
          </p>
          <div className="flex items-start gap-3">
            {image && (
              <img src={image} alt={property.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-snug">{property.title}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />{property.district}, {property.city}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
                <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
                <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area}m²</span>
              </div>
              <p className="text-sm font-bold text-primary mt-1.5">${property.price.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium pt-1 border-t border-primary/20">
            Is that correct?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDeny}
            disabled={isSubmitting}
            className="py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, go back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Yes, proceed</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          This will use 1 of your {remaining} remaining free valuations.
        </p>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STAGE: result — show valuation output
  // ────────────────────────────────────────────────────────────────────────────
  if (!result) return null;

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
          <span className="text-[10px] text-muted-foreground ms-auto">{result.confidenceLabel} confidence</span>
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

  const diffHighlight: "positive" | "negative" | "neutral" =
    result.discountPercent <= -5 ? "positive" :
    result.discountPercent >= 5  ? "negative" : "neutral";

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
      {/* Header — always names the property */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" /> AI Valuation Engine
          </h3>
          {property && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {property.title} · {property.city}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{result.confidenceLabel} confidence</span>
          {remaining > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
              title="Reset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <VerdictBadge verdict={result.verdict} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile label="AI Est. Value"  value={`$${result.estimatedValue.toLocaleString()}`} />
        <MetricTile
          label="vs Market"
          value={`${result.discountPercent > 0 ? "+" : ""}${result.discountPercent}%`}
          sub={result.discountPercent <= -5 ? "Below market" : result.discountPercent >= 5 ? "Above market" : "Fair value"}
          highlight={diffHighlight}
        />
        <MetricTile label="Price / m²"   value={`$${result.pricePerSqm}`} />
        <MetricTile label="Market / m²"  value={`$${result.marketPricePerSqm}`} />
      </div>

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

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Comparable Properties</p>
        <div className="space-y-1.5">
          {result.comparables.map(c => (
            <div key={c.title} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-foreground">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.distance} · {c.similarity}% similar</p>
              </div>
              <div className="text-end">
                <p className="text-xs font-semibold text-foreground">${c.price.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">${c.pricePerSqm}/m²</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.scoreBreakdown?.length > 0 && (
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

      {remaining === 0 ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 text-center">
          This was your last free valuation.{" "}
          <button onClick={() => navigate("/pricing")} className="underline font-semibold">Upgrade to Pro</button>{" "}
          for unlimited.
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground text-center">
          {remaining} free valuation{remaining === 1 ? "" : "s"} remaining.
          Each valuation is scoped to one specific property.
        </p>
      )}
    </div>
  );
}
