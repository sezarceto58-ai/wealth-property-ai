import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, TIERS, TierKey } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User, CreditCard, Shield, Check, Crown, Loader2,
  ExternalLink, ShieldCheck, Languages, Globe, CheckCircle2,
} from "lucide-react";
import RoleSwitcher from "@/components/settings/RoleSwitcher";

const LANGUAGES = [
  { code: "en", label: "English",        nativeLabel: "English",  flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "Arabic",         nativeLabel: "عربي",     flag: "🇮🇶", dir: "rtl" },
  { code: "ku", label: "Kurdish Sorani", nativeLabel: "کوردی",   flag: "🏳️", dir: "rtl" },
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { tier, subscribed, subscriptionEnd, loading: subLoading, subscribe, manageSubscription, checkSubscription } = useSubscription();

  const tabs = [
    { id: "profile",  label: t("settings.profile"),  icon: User },
    { id: "role",     label: t("settings.role"),      icon: ShieldCheck },
    { id: "language", label: t("settings.language"),  icon: Languages },
    { id: "billing",  label: t("settings.billing"),   icon: CreditCard },
    { id: "security", label: t("settings.security"),  icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-1">{t("settings.title")}</h1>
      <p className="text-muted-foreground mb-8">
        {t("common.profile")} • {t("settings.billing")} • {t("settings.security")}
      </p>

      {/* Scrollable tab nav */}
      <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile"  && <ProfileTab user={user} toast={toast} t={t} />}
      {activeTab === "role"     && <RoleSwitcher />}
      {activeTab === "language" && <LanguageTab t={t} />}
      {activeTab === "billing"  && (
        <BillingTab
          tier={tier} subscribed={subscribed} subscriptionEnd={subscriptionEnd}
          loading={subLoading} subscribe={subscribe}
          manageSubscription={manageSubscription} checkSubscription={checkSubscription}
          t={t}
        />
      )}
      {activeTab === "security" && <SecurityTab toast={toast} t={t} />}
    </div>
  );
}

/* ─── Language Tab ─── */
function LanguageTab({ t }: { t: any }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">{t("settings.chooseLanguage")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.languageNote")}</p>
      </div>

      <div className="space-y-3">
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
              }`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-foreground ${isActive ? "text-primary" : ""}`}>
                  {lang.nativeLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang.label} · {lang.dir.toUpperCase()}
                </p>
              </div>
              {isActive && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("settings.selectLanguage")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t("settings.languageNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab({ user, toast, t }: any) {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    if (user) {
      await (supabase as any).from("profiles").update({ display_name: displayName, phone }).eq("user_id", user.id);
    }
    setSaving(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("common.success"), description: t("common.save") + "d." });
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center text-xl font-bold text-white">
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
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" dir="ltr" />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin me-2" /> {t("common.loading")}</> : t("common.save")}
      </Button>
    </div>
  );
}

/* ─── Billing Tab ─── */
function BillingTab({ tier, subscribed, subscriptionEnd, loading, subscribe, manageSubscription, checkSubscription, t }: {
  tier: TierKey; subscribed: boolean; subscriptionEnd: string | null;
  loading: boolean; subscribe: (p: string) => Promise<void>;
  manageSubscription: () => Promise<void>; checkSubscription: () => Promise<void>;
  t: any;
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
    try { await manageSubscription(); }
    catch (err: any) { toast({ title: "Portal unavailable", description: err.message, variant: "destructive" }); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("pricing.currentPlan")}</p>
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
          <Button variant="outline" size="sm" onClick={checkSubscription}>Refresh</Button>
          {subscribed && (
            <Button variant="outline" size="sm" onClick={handleManage}>
              Manage <ExternalLink className="w-3 h-3 ms-1" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, plan]) => {
          const isCurrent = key === tier;
          const isPopular = key === "pro";
          return (
            <div key={key} className={`relative rounded-2xl border p-6 flex flex-col ${
              isCurrent ? "border-primary bg-primary/5" : isPopular ? "border-primary/40" : "border-border bg-card"
            }`}>
              {isPopular && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">
                  {t("pricing.mostPopular")}
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-gold text-white text-xs font-semibold">
                  {t("pricing.yourPlan")}
                </span>
              )}
              <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-foreground">${plan.monthly.price}</span>
                <span className="text-muted-foreground text-sm">{t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">{t("pricing.currentPlan")}</Button>
              ) : key === "free" ? (
                subscribed ? (
                  <Button variant="outline" onClick={handleManage} className="w-full">{t("pricing.downgrade")}</Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">{t("pricing.currentPlan")}</Button>
                )
              ) : (
                <Button onClick={() => handleSubscribe(key)} disabled={subscribing !== null} className="w-full">
                  {subscribing === key && <Loader2 className="w-4 h-4 animate-spin me-2" />}
                  {tier !== "free" ? t("pricing.switchPlan") : t("pricing.getStarted")}
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
function SecurityTab({ toast, t }: any) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [saving, setSaving]     = useState(false);

  const handleUpdate = async () => {
    if (password.length < 6) {
      toast({ title: t("common.error"), description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: t("common.error"), description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("common.success") });
      setPassword(""); setConfirm("");
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" dir="ltr" />
      </div>
      <Button onClick={handleUpdate} disabled={saving}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin me-2" /> Updating…</> : "Update Password"}
      </Button>
    </div>
  );
}
