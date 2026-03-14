import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const TIERS = {
  free: {
    name: "Free",
    monthly: { price_id: "price_1T3J60RqPv86QmN4g7IkhjM7", price: 0 },
    yearly:  { price_id: "price_1T3J60RqPv86QmN4g7IkhjM7", price: 0 },
    product_id: "prod_U1LnxxW5quYjSn",
    features: [
      "Browse marketplace",
      "Save up to 5 favorites",
      "3 offers per month",
      "Basic property search",
    ],
  },
  pro: {
    name: "Pro",
    monthly: { price_id: "price_1T3J6aRqPv86QmN4R2yLkgXL", price: 29 },
    yearly:  { price_id: "price_1T8nDYCfgiuhj2mtxW4tnMmL", price: 243.60 },
    product_id: "prod_U1LoY0ChJHxRfM",
    yearly_product_id: "prod_U71G3QywWMxBVI",
    discount: 30,
    features: [
      "Everything in Free",
      "Unlimited favorites & offers",
      "Analytics dashboard",
      "Priority alerts",
      "CRM tools",
    ],
  },
  elite: {
    name: "Elite",
    monthly: { price_id: "price_1T3J6qRqPv86QmN4u811AFF2", price: 79 },
    yearly:  { price_id: "price_1T8nVdCfgiuhj2mtCPv5exkY", price: 474 },
    product_id: "prod_U1LocwDTmSN7Od",
    yearly_product_id: "prod_U71Y9YCOPDel4X",
    discount: 50,
    features: [
      "Everything in Pro",
      "Investor portfolio tools",
      "Deposit verification",
      "Proof-of-funds uploads",
      "Dedicated support",
    ],
  },
} as const;

export type TierKey         = keyof typeof TIERS;
export type BillingInterval = "monthly" | "yearly";

export function getTierByProductId(productId: string | null): TierKey {
  if (!productId) return "free";
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
    if ("yearly_product_id" in tier && tier.yearly_product_id === productId) return key as TierKey;
  }
  return "free";
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscribed,       setSubscribed]       = useState(false);
  const [tier,             setTier]             = useState<TierKey>("free");
  const [subscriptionEnd,  setSubscriptionEnd]  = useState<string | null>(null);
  const [loading,          setLoading]          = useState(true);
  // Whether Stripe is configured in this environment
  const [stripeAvailable,  setStripeAvailable]  = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscribed(false);
      setTier("free");
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      // Edge function returns 200 with subscribed: false when Stripe key is absent
      setSubscribed(data.subscribed ?? false);
      setTier(getTierByProductId(data.product_id ?? null));
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.warn("[useSubscription] check-subscription failed — defaulting to free:", err);
      setTier("free");
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  /**
   * Open Stripe Checkout.
   * If Stripe is not configured (503), throws a user-friendly error that
   * the Pricing page can catch and display — rather than a raw 500.
   */
  const subscribe = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });

    if (error) throw error;

    // 503 = Stripe not configured
    if (data?.code === "STRIPE_NOT_CONFIGURED") {
      setStripeAvailable(false);
      throw new Error(
        "Payment processing is not yet available. Please contact support@terravista.iq to upgrade your plan."
      );
    }

    if (data?.error) throw new Error(data.error);
    if (data?.url) window.open(data.url, "_blank");
  };

  const manageSubscription = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.code === "STRIPE_NOT_CONFIGURED") {
      throw new Error(
        "Billing portal is not yet available. Please contact support@terravista.iq."
      );
    }
    if (data?.error) throw new Error(data.error);
    if (data?.url) window.open(data.url, "_blank");
  };

  return {
    subscribed,
    tier,
    subscriptionEnd,
    loading,
    stripeAvailable,
    subscribe,
    manageSubscription,
    checkSubscription,
  };
}
