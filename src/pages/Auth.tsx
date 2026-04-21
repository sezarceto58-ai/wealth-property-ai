import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [displayName, setDisplayName]   = useState("");
  const [role, setRole]                 = useState<"buyer" | "seller" | "developer">("buyer");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate  = useNavigate();
  const { toast } = useToast();
  const isRTL     = i18n.dir() === "rtl";

  // ── Role-aware redirect after login ──────────────────────────────────────
  const redirectByRole = async (userId: string) => {
    try {
      const redirect = searchParams.get("redirect");
      if (redirect) { navigate(decodeURIComponent(redirect)); return; }

      const { data: { user } } = await supabase.auth.getUser();
      const metaRole = user?.user_metadata?.role;

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const actualRole: string = (roleRow as any)?.role ?? metaRole ?? "buyer";

      if (actualRole === "admin")     { navigate("/admin");     return; }
      if (actualRole === "developer") { navigate("/developer"); return; }
      if (actualRole === "seller")    { navigate("/seller");    return; }
      navigate("/buyer");
    } catch {
      navigate("/buyer");
    }
  };

  // ── Sign-in / Sign-up handler ─────────────────────────────────────────────
  const handleAuth = async () => {
    if (!email.trim()) {
      toast({ title: t("common.error"), description: t("auth.enterEmail", "Please enter your email."), variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: t("common.error"), description: t("auth.enterPassword", "Please enter your password."), variant: "destructive" });
      return;
    }
    if (tab === "signup") {
      if (!displayName.trim()) {
        toast({ title: t("common.error"), description: t("auth.enterName", "Please enter your name."), variant: "destructive" });
        return;
      }
      if (password.length < 6) {
        toast({ title: t("common.error"), description: t("auth.passwordTooShort", "Password must be at least 6 characters."), variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t("common.error"), description: t("auth.passwordMismatch", "Passwords do not match."), variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (data.user) await redirectByRole(data.user.id);

      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim(), role } },
        });
        if (error) throw error;
        if (data.user) {
          // Insert role row — ignore duplicate errors (idempotent)
          await supabase.from("user_roles").upsert(
            { user_id: data.user.id, role },
            { onConflict: "user_id,role" }
          );
          if (data.session) {
            // Email confirmation disabled — go straight in
            await redirectByRole(data.user.id);
          } else {
            // Email confirmation required
            toast({
              title: t("common.success"),
              description: t("auth.checkEmail", "Check your email to verify your account, then sign in."),
            });
            setTab("login");
          }
        }
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password handler ───────────────────────────────────────────────
  const handleForgot = async () => {
    if (!email.trim()) {
      toast({ title: t("common.error"), description: t("auth.enterEmail", "Enter your email."), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.resetEmailSent", "Reset link sent"), description: t("auth.checkEmailReset", "Check your inbox for the password reset link.") });
      setTab("login");
    }
  };

  // ── Role cards data ───────────────────────────────────────────────────────
  const roleCards = [
    {
      value: "buyer" as const,
      label: t("auth.buyer", "Buyer / Investor"),
      desc: t("auth.buyerDesc", "Browse properties, make offers, track portfolio"),
      icon: "🏠",
    },
    {
      value: "seller" as const,
      label: t("auth.seller", "Seller / Agent"),
      desc: t("auth.sellerDesc", "List properties, manage leads, track performance"),
      icon: "🏢",
    },
    {
      value: "developer" as const,
      label: t("auth.developer", "Developer"),
      desc: t("auth.developerDesc", "Analyze land, run AI plans, manage projects"),
      icon: "🏗️",
    },
  ] as const;

  // ── Helper component ──────────────────────────────────────────────────────
  const IconInput = ({
    type, value, onChange, placeholder, icon: Icon, className = "", extra,
  }: {
    type: string; value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    icon: React.ElementType;
    className?: string;
    extra?: React.ReactNode;
  }) => (
    <div className="relative">
      <Icon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRTL ? "right-3" : "left-3"}`} />
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { if (tab === "forgot") { handleForgot(); } else { handleAuth(); } } }}
        placeholder={placeholder}
        className={`${isRTL ? "pr-9" : "pl-9"} ${extra ? (isRTL ? "pl-10" : "pr-10") : ""} ${className}`}
        dir={type === "email" || type === "password" ? "ltr" : undefined}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : undefined}
      />
      {extra}
    </div>
  );

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPassword(p => !p)}
      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "left-2" : "right-2"}`}
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-display font-bold text-gradient-gold">AqarAI</span>
        </Link>
        <LanguageToggle />
      </div>

      {/* ── Main card ── */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border shadow-card p-6 sm:p-8 space-y-6">

            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {tab === "login"  ? t("auth.signInTitle") :
                 tab === "signup" ? t("auth.signUpTitle") :
                 t("auth.resetPassword")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "login"  ? t("auth.hasAccount")  :
                 tab === "signup" ? t("auth.noAccount")   : ""}
              </p>
            </div>

            {/* Tab switcher */}
            {tab !== "forgot" && (
              <div className="flex gap-1 bg-secondary rounded-xl p-1">
                {(["login", "signup"] as const).map(t2 => (
                  <button
                    key={t2}
                    onClick={() => setTab(t2)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === t2 ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t2 === "login" ? t("common.signIn") : t("common.signUp")}
                  </button>
                ))}
              </div>
            )}

            {/* Back from forgot */}
            {tab === "forgot" && (
              <button
                onClick={() => setTab("login")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                {t("auth.backToLogin")}
              </button>
            )}

            <div className="space-y-4">

              {/* Display name — signup only */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.displayName")}</Label>
                  <IconInput type="text" value={displayName} onChange={setDisplayName} placeholder={t("auth.displayName")} icon={User} />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <IconInput type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
              </div>

              {/* Password */}
              {tab !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t("auth.password")}</Label>
                    {tab === "login" && (
                      <button onClick={() => setTab("forgot")} className="text-xs text-primary hover:underline">
                        {t("auth.forgotPassword")}
                      </button>
                    )}
                  </div>
                  <IconInput
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    icon={Lock}
                    extra={eyeButton}
                  />
                </div>
              )}

              {/* Confirm password — signup only */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.confirmPassword")}</Label>
                  <IconInput
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirm}
                    placeholder="••••••••"
                    icon={Lock}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-destructive mt-1">
                      {t("auth.passwordMismatch", "Passwords do not match")}
                    </p>
                  )}
                </div>
              )}

              {/* Role selection — signup only */}
              {tab === "signup" && (
                <div className="space-y-3">
                  <Label>{t("auth.selectRole")}</Label>
                  <RadioGroup value={role} onValueChange={v => setRole(v as typeof role)}>
                    <div className="space-y-2">
                      {roleCards.map(rc => (
                        <label
                          key={rc.value}
                          htmlFor={rc.value}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            role === rc.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 hover:bg-secondary/30"
                          }`}
                        >
                          <RadioGroupItem value={rc.value} id={rc.value} className="mt-0.5 shrink-0" />
                          <span className="text-xl shrink-0">{rc.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-snug">{rc.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rc.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* CTA button */}
              <Button
                onClick={tab === "forgot" ? handleForgot : handleAuth}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading
                  ? t("common.loading")
                  : tab === "login"  ? t("common.signIn")
                  : tab === "signup" ? t("common.signUp")
                  : t("auth.sendResetLink")}
              </Button>

              {/* Footer link */}
              {tab === "login" && (
                <p className="text-center text-xs text-muted-foreground">
                  {t("auth.noAccountYet", "Don't have an account?")}{" "}
                  <button onClick={() => setTab("signup")} className="text-primary hover:underline font-medium">
                    {t("common.signUp")}
                  </button>
                </p>
              )}
              {tab === "signup" && (
                <p className="text-center text-xs text-muted-foreground">
                  {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
                  <button onClick={() => setTab("login")} className="text-primary hover:underline font-medium">
                    {t("common.signIn")}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
