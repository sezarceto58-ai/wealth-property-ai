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

// ─────────────────────────────────────────────────────────────────────────────
// IconInput is defined OUTSIDE the component to prevent remounting on re-render.
// Defining components inside another component causes React to treat them as
// new components every render, unmounting/remounting the input and losing focus.
// ─────────────────────────────────────────────────────────────────────────────
interface IconInputProps {
  type: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  iconLeft: boolean; // true = icon on left (LTR), false = icon on right (RTL)
  showRightSlot: boolean;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
  iconEl: React.ReactNode;
}

function IconInput({
  type, value, onChange, onSubmit, placeholder,
  iconLeft, showRightSlot, rightSlot, autoComplete, iconEl,
}: IconInputProps) {
  return (
    <div className="relative">
      <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none flex items-center justify-center ${iconLeft ? "left-3" : "right-3"}`}>
        {iconEl}
      </span>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSubmit(); }}
        placeholder={placeholder}
        className={`${iconLeft ? "pl-9" : "pr-9"} ${showRightSlot ? (iconLeft ? "pr-10" : "pl-10") : ""}`}
        dir={type === "email" || type === "password" ? "ltr" : undefined}
        autoComplete={autoComplete}
      />
      {showRightSlot && rightSlot}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Auth Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Auth() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole]               = useState<"buyer" | "seller" | "developer">("buyer");
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate  = useNavigate();
  const { toast } = useToast();
  const isRTL     = i18n.dir() === "rtl";
  const iconLeft  = !isRTL;

  // ── Redirect after auth ──────────────────────────────────────────────────
  const redirectByRole = async (userId: string) => {
    try {
      const redirect = searchParams.get("redirect");
      if (redirect) { navigate(decodeURIComponent(redirect)); return; }
      const { data: { user } } = await supabase.auth.getUser();
      const metaRole = user?.user_metadata?.role;
      const { data: roleRow } = await supabase
        .from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      const actualRole: string = (roleRow as any)?.role ?? metaRole ?? "buyer";
      if (actualRole === "admin")     { navigate("/admin");     return; }
      if (actualRole === "developer") { navigate("/developer"); return; }
      if (actualRole === "seller")    { navigate("/seller");    return; }
      navigate("/buyer");
    } catch { navigate("/buyer"); }
  };

  // ── Submit handlers ──────────────────────────────────────────────────────
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
          email: email.trim(), password,
          options: { data: { display_name: displayName.trim(), role } },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("user_roles").upsert({ user_id: data.user.id, role }, { onConflict: "user_id,role" });
          if (data.session) {
            await redirectByRole(data.user.id);
          } else {
            toast({ title: t("common.success"), description: t("auth.checkEmail", "Check your email to verify your account, then sign in.") });
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

  const submit = tab === "forgot" ? handleForgot : handleAuth;

  const eyeSlot = (
    <button
      type="button"
      onClick={() => setShowPassword(p => !p)}
      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "left-2" : "right-2"}`}
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const roleCards = [
    { value: "buyer" as const,     emoji: "🏠", label: t("auth.buyer", "Buyer / Investor"),     desc: t("auth.buyerDesc", "Browse properties, make offers, track portfolio") },
    { value: "seller" as const,    emoji: "🏢", label: t("auth.seller", "Seller / Agent"),      desc: t("auth.sellerDesc", "List properties, manage leads, track performance") },
    { value: "developer" as const, emoji: "🏗️", label: t("auth.developer", "Developer"),        desc: t("auth.developerDesc", "Analyze land, run AI plans, manage projects") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-display font-bold text-gradient-gold">AqarAI</span>
        </Link>
        <LanguageToggle />
      </div>

      {/* Card */}
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
                {tab === "login"  ? t("auth.hasAccount") :
                 tab === "signup" ? t("auth.noAccount")  : ""}
              </p>
            </div>

            {/* Tab switcher */}
            {tab !== "forgot" && (
              <div className="flex gap-1 bg-secondary rounded-xl p-1">
                {(["login", "signup"] as const).map(t2 => (
                  <button key={t2} onClick={() => setTab(t2)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      tab === t2 ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t2 === "login" ? t("common.signIn") : t("common.signUp")}
                  </button>
                ))}
              </div>
            )}

            {tab === "forgot" && (
              <button onClick={() => setTab("login")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                {t("auth.backToLogin")}
              </button>
            )}

            <div className="space-y-4">

              {/* Display name */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.displayName")}</Label>
                  <IconInput type="text" value={displayName} onChange={setDisplayName} onSubmit={submit}
                    placeholder={t("auth.displayName")} iconLeft={iconLeft} showRightSlot={false}
                    iconEl={<User className="w-4 h-4" />} />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <IconInput type="email" value={email} onChange={setEmail} onSubmit={submit}
                  placeholder="you@example.com" iconLeft={iconLeft} showRightSlot={false}
                  autoComplete="email" iconEl={<Mail className="w-4 h-4" />} />
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
                    value={password} onChange={setPassword} onSubmit={submit}
                    placeholder="••••••••" iconLeft={iconLeft}
                    showRightSlot autoComplete={tab === "login" ? "current-password" : "new-password"}
                    rightSlot={eyeSlot} iconEl={<Lock className="w-4 h-4" />}
                  />
                </div>
              )}

              {/* Confirm password */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.confirmPassword")}</Label>
                  <IconInput
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword} onChange={setConfirm} onSubmit={submit}
                    placeholder="••••••••" iconLeft={iconLeft}
                    showRightSlot={false} autoComplete="new-password"
                    iconEl={<Lock className="w-4 h-4" />}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-destructive">{t("auth.passwordMismatch", "Passwords do not match")}</p>
                  )}
                </div>
              )}

              {/* Role cards */}
              {tab === "signup" && (
                <div className="space-y-3">
                  <Label>{t("auth.selectRole")}</Label>
                  <RadioGroup value={role} onValueChange={v => setRole(v as typeof role)}>
                    <div className="space-y-2">
                      {roleCards.map(rc => (
                        <label key={rc.value} htmlFor={rc.value}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            role === rc.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/30"
                          }`}
                        >
                          <RadioGroupItem value={rc.value} id={rc.value} className="mt-0.5 shrink-0" />
                          <span className="text-xl shrink-0">{rc.emoji}</span>
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

              {/* CTA */}
              <Button onClick={submit} disabled={loading} className="w-full" size="lg">
                {loading ? t("common.loading")
                  : tab === "login"  ? t("common.signIn")
                  : tab === "signup" ? t("common.signUp")
                  : t("auth.sendResetLink")}
              </Button>

              {/* Footer */}
              {tab === "login" && (
                <p className="text-center text-xs text-muted-foreground">
                  {t("auth.noAccountYet", "Don't have an account?")}{" "}
                  <button onClick={() => setTab("signup")} className="text-primary hover:underline font-medium">{t("common.signUp")}</button>
                </p>
              )}
              {tab === "signup" && (
                <p className="text-center text-xs text-muted-foreground">
                  {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
                  <button onClick={() => setTab("login")} className="text-primary hover:underline font-medium">{t("common.signIn")}</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
