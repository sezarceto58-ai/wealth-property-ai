import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Sparkles, Loader2, ArrowRight, AlertCircle, Mail } from "lucide-react";
import { useSubscription, TIERS, TierKey, BillingInterval } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// ── Plan config with exact features from spec ──
const PLAN_CONFIG: Record<TierKey, {
  icon: React.ElementType;
  color: string;
  ringColor: string;
  badgeBg: string;
  badgeText: string;
  ctaClass: string;
  highlighted: boolean;
}> = {
  free: {
    icon: Zap,
    color: "text-muted-foreground",
    ringColor: "border-border",
    badgeBg: "bg-secondary",
    badgeText: "text-secondary-foreground",
    ctaClass: "border border-border bg-card text-foreground hover:bg-secondary/60",
    highlighted: false,
  },
  pro: {
    icon: Sparkles,
    color: "text-primary",
    ringColor: "border-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    ctaClass: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    highlighted: true,
  },
  elite: {
    icon: Crown,
    color: "text-yellow-600 dark:text-yellow-400",
    ringColor: "border-yellow-400",
    badgeBg: "bg-yellow-50 dark:bg-yellow-900/20",
    badgeText: "text-yellow-700 dark:text-yellow-400",
    ctaClass: "bg-gradient-gold text-white hover:opacity-90 shadow-gold",
    highlighted: false,
  },
};

function PlanCard({
  planKey, billing, onSubscribe, subscribing, currentTier,
}: {
  planKey: TierKey;
  billing: BillingInterval;
  onSubscribe: (key: TierKey) => void;
  subscribing: string | null;
  currentTier: TierKey;
}) {
  const { t } = useTranslation();
  const plan   = TIERS[planKey];
  const config = PLAN_CONFIG[planKey];
  const Icon   = config.icon;

  const isCurrent  = currentTier === planKey;
  const isLoading  = subscribing === planKey;

  const displayPrice = billing === "yearly"
    ? (plan.yearly.price / 12)
    : plan.monthly.price;

  const yearlyTotal = plan.yearly.price;
  const discount    = "discount" in plan ? plan.discount : 0;

  return (
    <div className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${
      config.highlighted
        ? `${config.ringColor} shadow-lg`
        : `border-border hover:${config.ringColor} hover:shadow-md`
    }`}>
      {/* Most popular badge */}
      {config.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-sm">
            {t("pricing.mostPopularBadge")}
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3 ${config.badgeBg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-bold ${config.badgeText}`}>{plan.name}</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-black text-foreground">
              {displayPrice === 0 ? "Free" : `$${displayPrice % 1 === 0 ? displayPrice : displayPrice.toFixed(2)}`}
            </span>
            {displayPrice > 0 && (
              <span className="text-sm text-muted-foreground mb-1">{t("pricing.perMonthShort")}</span>
            )}
          </div>
          {billing === "yearly" && yearlyTotal > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("pricing.billedYearly", { amount: yearlyTotal })}
              {discount > 0 && (
                <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t("pricing.savePercent", { percent: discount })}
                </span>
              )}
            </p>
          )}
          {billing === "monthly" && displayPrice === 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{t("pricing.alwaysFree")}</p>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.badgeBg}`}>
              <Check className={`w-3 h-3 ${config.color}`} />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div className="py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold text-center">
          {t("pricing.currentPlanCheck")}
        </div>
      ) : planKey === "free" && currentTier !== "free" ? (
        <div className="py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium text-center opacity-60">
          {t("pricing.downgradeBtn")}
        </div>
      ) : (
        <button
          onClick={() => onSubscribe(planKey)}
          disabled={isLoading}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${config.ctaClass} disabled:opacity-60`}
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t("pricing.processing")}</>
          ) : planKey === "free" ? (
            <>{t("pricing.getStartedFree")}</>
          ) : (
            <>{t("pricing.upgradeBtn", { plan: plan.name })} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const { tier, subscribed, subscribe, manageSubscription, loading, stripeAvailable } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingInterval>("monthly");

  const handleSubscribe = async (key: TierKey) => {
    if (key === "free") { navigate("/buyer"); return; }
    // If Stripe is not configured, open email instead
    if (!stripeAvailable) {
      window.location.href = `mailto:support@aqarai.iq?subject=Upgrade to ${TIERS[key].name}&body=Hello, I would like to upgrade my AqarAI account to the ${TIERS[key].name} plan.`;
      return;
    }
    setSubscribing(key);
    try {
      await subscribe(TIERS[key][billing].price_id);
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">

      {/* Stripe not configured — show contact banner instead of crashing */}
      {!stripeAvailable && (
        <div className="mx-4 mb-8 rounded-2xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">{t("pricing.paymentComingSoon")}</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              {t("pricing.upgradeNote")}
            </p>
          </div>
          <a
            href="mailto:support@aqarai.iq"
            className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors shrink-0 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> {t("pricing.contactSupport")}
          </a>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
          {t("pricing.title")}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm sm:text-base">
          {t("pricing.subtitle")}
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary p-1">
          {(["monthly", "yearly"] as BillingInterval[]).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === b
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b === "monthly" ? t("pricing.monthly") : t("pricing.yearly")}
            </button>
          ))}
        </div>

        {billing === "yearly" && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            {t("pricing.yearlySavings")}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-4">
          {(Object.keys(TIERS) as TierKey[]).map((key) => (
            <PlanCard
              key={key}
              planKey={key}
              billing={billing}
              onSubscribe={handleSubscribe}
              subscribing={subscribing}
              currentTier={tier}
            />
          ))}
        </div>
      )}

      {/* Manage subscription */}
      {subscribed && (
        <div className="mt-8 text-center">
          <button
            onClick={manageSubscription}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t("pricing.manageSubscription")}
          </button>
        </div>
      )}

      {/* Feature comparison table (mobile: hidden, desktop: shown) */}
      <div className="mt-12 px-4 hidden sm:block">
        <h2 className="text-lg font-display font-bold text-foreground text-center mb-6">
          {t("pricing.fullFeatureComparison")}
        </h2>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 font-semibold text-foreground w-1/2">{t("pricing.featureColumn")}</th>
                {(Object.keys(TIERS) as TierKey[]).map((k) => (
                  <th key={k} className={`text-center px-4 py-3 font-bold ${PLAN_CONFIG[k].color}`}>
                    {TIERS[k].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Browse marketplace",          free: true,   pro: true,   elite: true  },
                { feature: "Basic property search",       free: true,   pro: true,   elite: true  },
                { feature: "Save favorites",              free: "5 max", pro: "∞",   elite: "∞"  },
                { feature: "Send offers",                 free: "3/mo",  pro: "∞",   elite: "∞"  },
                { feature: "Analytics dashboard",         free: false,  pro: true,   elite: true  },
                { feature: "Priority alerts",             free: false,  pro: true,   elite: true  },
                { feature: "CRM tools",                   free: false,  pro: true,   elite: true  },
                { feature: "Investor portfolio tools",    free: false,  pro: false,  elite: true  },
                { feature: "Deposit verification",        free: false,  pro: false,  elite: true  },
                { feature: "Proof-of-funds uploads",      free: false,  pro: false,  elite: true  },
                { feature: "Dedicated support",           free: false,  pro: false,  elite: true  },
                { feature: "Mortgage calculator",         free: true,   pro: true,   elite: true  },
              ].map(({ feature, ...vals }) => (
                <tr key={feature} className="border-b border-border last:border-0 hover:bg-secondary/10">
                  <td className="px-5 py-3 text-foreground">{feature}</td>
                  {(["free", "pro", "elite"] as TierKey[]).map((k) => {
                    const val = vals[k as keyof typeof vals];
                    return (
                      <td key={k} className="px-4 py-3 text-center">
                        {val === true ? (
                          <span className={`text-lg ${PLAN_CONFIG[k].color}`}>✓</span>
                        ) : val === false ? (
                          <span className="text-muted-foreground/40 text-lg">—</span>
                        ) : (
                          <span className="text-xs font-semibold text-foreground">{val as string}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10 px-4">
        <h2 className="text-lg font-display font-bold text-foreground text-center mb-5">
          {t("pricing.commonQuestions")}
        </h2>
        <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {[
            { q: "Can I switch plans at any time?", a: "Yes — upgrades take effect immediately. Downgrades apply at the end of your current billing period." },
            { q: "What happens to my data if I downgrade?", a: "All your data is preserved. Gated features become inaccessible but nothing is deleted." },
            { q: "Is there a free trial for Pro or Elite?", a: "We offer a 7-day trial for Pro. Contact support@aqarai.iq for an Elite trial." },
            { q: "Are the prices in USD?", a: "Yes, all prices are in US Dollars. IQD payments can be arranged through our support team." },
          ].map((item) => (
            <details key={item.q} className="group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-secondary/20 transition-colors">
                <span className="text-sm font-medium text-foreground">{item.q}</span>
                <ChevronDownIcon />
              </summary>
              <div className="px-5 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tiny inline chevron for FAQ (avoids extra import)
function ChevronDownIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-3"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
