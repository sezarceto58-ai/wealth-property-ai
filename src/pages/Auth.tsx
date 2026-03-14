import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";

export default function Auth() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole]               = useState<"buyer" | "seller" | "developer">("buyer");
  const [loading, setLoading]         = useState(false);
  const navigate  = useNavigate();
  const { toast } = useToast();

  const redirectByRole = async (userId: string) => {
    try {
      const redirect = searchParams.get("redirect");
      const { data: { user } } = await supabase.auth.getUser();
      const metaRole = user?.user_metadata?.role;
      const fallbackRole: "buyer" | "seller" | "developer" =
        metaRole === "seller" ? "seller" : metaRole === "developer" ? "developer" : "buyer";

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const actualRole: string = (roleRow as any)?.role ?? metaRole ?? fallbackRole;
      if (redirect) { navigate(redirect); return; }
      if (actualRole === "seller")    { navigate("/seller");    return; }
      if (actualRole === "developer") { navigate("/developer"); return; }
      if (actualRole === "admin")     { navigate("/admin");     return; }
      navigate("/buyer");
    } catch {
      navigate("/buyer");
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast({ title: t("common.error"), description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await redirectByRole(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName, role } },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role });
          if (data.session) {
            await redirectByRole(data.user.id);
          } else {
            toast({ title: t("common.success"), description: "Check your email to verify your account." });
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
    if (!email) { toast({ title: t("common.error"), description: "Enter your email.", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.resetEmailSent") });
    }
  };

  const isRTL = i18n.dir() === "rtl";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-display font-bold text-gradient-gold">TerraVista</span>
        </Link>
        <LanguageToggle />
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border shadow-card p-8 space-y-6">

            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {tab === "login" ? t("auth.signInTitle") :
                 tab === "signup" ? t("auth.signUpTitle") :
                 t("auth.resetPassword")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "login" ? t("auth.hasAccount") :
                 tab === "forgot" ? "" :
                 t("auth.noAccount")}
              </p>
            </div>

            {/* Tab switcher */}
            {tab !== "forgot" && (
              <div className="flex gap-1 bg-secondary rounded-xl p-1">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === "login" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("common.signIn")}
                </button>
                <button
                  onClick={() => setTab("signup")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === "signup" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("common.signUp")}
                </button>
              </div>
            )}

            {/* Back from forgot */}
            {tab === "forgot" && (
              <button
                onClick={() => setTab("login")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("auth.backToLogin")}
              </button>
            )}

            <div className="space-y-4">
              {/* Display name (signup only) */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.displayName")}</Label>
                  <div className="relative">
                    <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={t("auth.displayName")}
                      className={isRTL ? "pr-9" : "pl-9"}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                  <Input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={isRTL ? "pr-9" : "pl-9"}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              {tab !== "forgot" && (
                <div className="space-y-2">
                  <div className={`flex items-center justify-between`}>
                    <Label>{t("auth.password")}</Label>
                    {tab === "login" && (
                      <button onClick={() => setTab("forgot")} className="text-xs text-primary hover:underline">
                        {t("auth.forgotPassword")}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                    <Input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={isRTL ? "pr-9" : "pl-9"}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* Confirm password */}
              {tab === "signup" && (
                <div className="space-y-2">
                  <Label>{t("auth.confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className={isRTL ? "pr-9" : "pl-9"}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* Role selection */}
              {tab === "signup" && (
                <div className="space-y-3">
                  <Label>{t("auth.selectRole")}</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as any)}>
                    {(["buyer", "seller", "developer"] as const).map((r) => (
                      <div key={r} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors cursor-pointer">
                        <RadioGroupItem value={r} id={r} />
                        <Label htmlFor={r} className="cursor-pointer capitalize font-medium">
                          {t(`auth.${r}`)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={tab === "forgot" ? handleForgot : handleAuth}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>{tab === "login" ? t("auth.signingIn") : tab === "signup" ? t("auth.signingUp") : t("common.loading")}</>
                ) : (
                  <>{tab === "login" ? t("common.signIn") : tab === "signup" ? t("common.signUp") : t("auth.sendResetLink")}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
