import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, TIERS, TierKey } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  CreditCard,
  Shield,
  Check,
  Crown,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import RoleSwitcher from "@/components/settings/RoleSwitcher";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { user } = useAuth();
  const { toast } = useToast();
  const { tier, subscribed, subscriptionEnd, loading: subLoading, subscribe, manageSubscription, checkSubscription } = useSubscription();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "role", label: "Role", icon: ShieldCheck },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account, billing, and preferences.</p>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileTab user={user} toast={toast} />}
      {activeTab === "role" && <RoleSwitcher />}
      {activeTab === "billing" && (
        <BillingTab
          tier={tier}
          subscribed={subscribed}
          subscriptionEnd={subscriptionEnd}
          loading={subLoading}
          subscribe={subscribe}
          manageSubscription={manageSubscription}
          checkSubscription={checkSubscription}
        />
      )}
      {activeTab === "security" && <SecurityTab toast={toast} />}
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab({ user, toast }: any) {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });

    if (user) {
      await (supabase as any).from("profiles").update({ display_name: displayName, phone }).eq("user_id", user.id);
    }

    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center text-xl font-bold text-primary-foreground">
          {displayName?.slice(0, 2)?.toUpperCase() || user?.email?.slice(0, 2)?.toUpperCase() || "TV"}
        </div>
        <div>
          <p className="font-semibold text-foreground">{displayName || "User"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Display Name</Label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email || ""} disabled className="bg-muted/30" />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

/* ─── Billing Tab ─── */
function BillingTab({
  tier,
  subscribed,
  subscriptionEnd,
  loading,
  subscribe,
  manageSubscription,
  checkSubscription,
}: {
  tier: TierKey;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  subscribe: (priceId: string) => Promise<void>;
  manageSubscription: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}) {
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (key: TierKey) => {
    if (key === "free") return;
    setSubscribing(key);
    try {
      await subscribe(TIERS[key].monthly.price_id);
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  const handleManage = async () => {
    try {
      await manageSubscription();
    } catch (err: any) {
      toast({ title: "Portal unavailable", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current plan banner */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Current Plan</p>
          <p className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            {tier !== "free" && <Crown className="w-5 h-5 text-primary" />}
            {TIERS[tier].name}
          </p>
          {subscriptionEnd && (
            <p className="text-xs text-muted-foreground mt-1">
              Renews {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={checkSubscription}>
            Refresh Status
          </Button>
          {subscribed && (
            <Button variant="outline" size="sm" onClick={handleManage}>
              Manage <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, plan]) => {
          const isCurrent = key === tier;
          const isPopular = key === "pro";

          return (
            <div
              key={key}
              className={`relative rounded-xl border p-6 flex flex-col ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : isPopular
                  ? "border-primary/40"
                  : "border-border bg-card"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-gold text-primary-foreground text-xs font-semibold">
                  Your Plan
                </span>
              )}

              <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-foreground">${plan.monthly.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              ) : key === "free" ? (
                subscribed ? (
                  <Button variant="outline" onClick={handleManage} className="w-full">
                    Downgrade
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Current Plan
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => handleSubscribe(key)}
                  disabled={subscribing !== null}
                  className="w-full"
                >
                  {subscribing === key ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {tier !== "free" ? "Switch Plan" : "Upgrade"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Security Tab ─── */
function SecurityTab({ toast }: any) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Mismatch", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
      </div>
      <Button onClick={handleUpdatePassword} disabled={saving}>
        {saving ? "Updating..." : "Update Password"}
      </Button>
    </div>
  );
}
