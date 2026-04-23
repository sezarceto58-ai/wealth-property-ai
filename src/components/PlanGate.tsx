/**
 * PlanGate — wraps any feature behind a tier check.
 * Shows an upgrade overlay when the user's plan doesn't meet the requirement.
 */
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Crown, Zap } from "lucide-react";
import { useSubscription, TierKey } from "@/hooks/useSubscription";

const TIER_ORDER: TierKey[] = ["free", "pro", "elite"];

const TIER_STYLE = {
  free:  { icon: Zap,      label: "Free",  color: "text-muted-foreground", bg: "bg-secondary" },
  pro:   { icon: Sparkles, label: "Pro",   color: "text-primary",          bg: "bg-primary/10" },
  elite: { icon: Crown,    label: "Elite", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
};

const PLAN_FEATURES: Record<TierKey, string[]> = {
  free:  ["Browse marketplace", "Save up to 5 favorites", "3 offers per month", "Basic property search"],
  pro:   ["Unlimited favorites & offers", "Analytics dashboard", "Priority alerts", "CRM tools"],
  elite: ["Investor portfolio tools", "Deposit verification", "Proof-of-funds uploads", "Dedicated support"],
};

interface PlanGateProps {
  /** Minimum tier required to access the feature */
  requiredTier: TierKey;
  /** Content to render when access is granted */
  children: React.ReactNode;
  /** Render a compact locked badge instead of full overlay (default: false) */
  inline?: boolean;
  /** Label shown in the upgrade prompt */
  featureLabel?: string;
}

function tierMeetsRequirement(current: TierKey, required: TierKey) {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

export default function PlanGate({ requiredTier, children, inline = false, featureLabel }: PlanGateProps) {
  const { tier, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return <>{children}</>;
  if (tierMeetsRequirement(tier, requiredTier)) return <>{children}</>;

  const cfg = TIER_STYLE[requiredTier];
  const Icon = cfg.icon;

  // ── Inline: small locked badge ──
  if (inline) {
    return (
      <button
        onClick={() => navigate("/pricing")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color} border border-current/20 hover:opacity-80 transition-opacity`}
      >
        <Lock className="w-3 h-3" />
        {cfg.label} only
      </button>
    );
  }

  // ── Full overlay: blurred content with upgrade card on top ──
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred background preview */}
      <div className="select-none pointer-events-none blur-sm opacity-40 saturate-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm p-6">
        <div className="rounded-2xl bg-card border border-border shadow-card p-6 max-w-sm w-full text-center space-y-4">
          <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center mx-auto`}>
            <Icon className={`w-7 h-7 ${cfg.color}`} />
          </div>

          <div>
            <p className="font-bold text-foreground text-lg">
              {featureLabel ?? "This feature"} requires{" "}
              <span className={cfg.color}>{cfg.label}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to {cfg.label} to unlock this and more.
            </p>
          </div>

          <div className="rounded-xl bg-secondary/40 p-3 text-left space-y-1.5">
            {PLAN_FEATURES[requiredTier].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.color} bg-current`} />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/pricing")}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 ${
              requiredTier === "elite"
                ? "bg-gradient-gold text-white shadow-gold"
                : "bg-primary text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            Upgrade to {cfg.label}
          </button>

          <p className="text-xs text-muted-foreground">
            Current plan: <span className="font-semibold capitalize text-foreground">{tier}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Utility: returns whether current tier meets a requirement (for imperative checks) */
export function usePlanAccess(requiredTier: TierKey) {
  const { tier } = useSubscription();
  return tierMeetsRequirement(tier, requiredTier);
}
