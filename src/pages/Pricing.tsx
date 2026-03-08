import { useSubscription, TIERS, TierKey, BillingInterval } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Check, Crown, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { tier, subscribed, subscribe, manageSubscription, loading } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingInterval>("monthly");

  const handleSubscribe = async (key: TierKey) => {
    if (key === "free") return;
    setSubscribing(key);
    try {
      await subscribe(TIERS[key][billing].price_id);
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  const getDisplayPrice = (key: TierKey) => {
    const plan = TIERS[key];
    if (billing === "yearly") {
      const yearlyPrice = plan.yearly.price;
      const monthlyEquiv = yearlyPrice / 12;
      return monthlyEquiv;
    }
    return plan.monthly.price;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-3">
          {t("pricing.title")}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          {t("pricing.subtitle")}
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              billing === "yearly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("pricing.yearly")}
          </button>
        </div>
        {billing === "yearly" && (
           <p className="text-sm text-primary mt-2 font-medium">
            {t("pricing.yearlySavings")}
           </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, plan]) => {
            const isCurrent = key === tier;
            const isPopular = key === "pro";
            const displayPrice = getDisplayPrice(key);
            const discount = "discount" in plan ? plan.discount : undefined;

            return (
              <div
                key={key}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  isCurrent
                    ? "border-primary bg-primary/5 shadow-lg"
                    : isPopular
                    ? "border-primary/40 shadow-md"
                    : "border-border bg-card"
                }`}
              >
                {isPopular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {t("pricing.mostPopular")}
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-primary-foreground text-xs font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> {t("pricing.yourPlan")}
                  </span>
                )}

                <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${displayPrice === 0 ? "0" : displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2)}
                  </span>
                  <span className="text-muted-foreground">{t("pricing.perMonth")}</span>
                </div>

                {billing === "yearly" && discount && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">
                      ${plan.monthly.price}/mo
                    </span>
                     <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {t("pricing.save")} {discount}%
                     </span>
                  </div>
                )}
                {billing === "yearly" && key !== "free" && (
                   <p className="text-xs text-muted-foreground mb-4">
                    {t("pricing.billed")} ${plan.yearly.price}{t("pricing.perYear")}
                  </p>
                )}
                {(billing === "monthly" || key === "free") && !discount && <div className="mb-4" />}

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    {t("pricing.currentPlan")}
                  </Button>
                ) : key === "free" ? (
                  subscribed ? (
                    <Button variant="outline" onClick={() => manageSubscription()} className="w-full">
                      {t("pricing.downgrade")}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full">
                      {t("pricing.currentPlan")}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => handleSubscribe(key)}
                    disabled={subscribing !== null}
                    className="w-full"
                  >
                    {subscribing === key && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {tier !== "free" ? t("pricing.switchPlan") : t("pricing.getStarted")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
