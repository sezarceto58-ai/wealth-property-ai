import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const TIERS = {
  free: {
    name: "Free",
    price_id: "price_1T3J60RqPv86QmN4g7IkhjM7",
    product_id: "prod_U1LnxxW5quYjSn",
    price: 0,
    features: [
      "Browse marketplace",
      "Save up to 5 favorites",
      "3 offers per month",
      "Basic property search",
    ],
  },
  pro: {
    name: "Pro",
    price_id: "price_1T3J6aRqPv86QmN4R2yLkgXL",
    product_id: "prod_U1LoY0ChJHxRfM",
    price: 29,
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
    price_id: "price_1T3J6qRqPv86QmN4u811AFF2",
    product_id: "prod_U1LocwDTmSN7Od",
    price: 79,
    features: [
      "Everything in Pro",
      "Investor portfolio tools",
      "Deposit verification",
      "Proof-of-funds uploads",
      "Dedicated support",
    ],
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierByProductId(productId: string | null): TierKey {
  if (!productId) return "free";
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return "free";
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<TierKey>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setSubscribed(data.subscribed ?? false);
      setTier(getTierByProductId(data.product_id));
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.error("Failed to check subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const subscribe = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  const manageSubscription = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  return { subscribed, tier, subscriptionEnd, loading, subscribe, manageSubscription, checkSubscription };
}
