import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2, Search, TrendingUp, Shield, ArrowRight, Star,
  MapPin, Bed, Sparkles, BarChart3, Zap, CheckCircle2,
} from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-property.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const featuredProperties = [
  { image: prop1, titleKey: "landing.villa",      price: "$450,000", beds: 4, score: 92, city: "Erbil",   tag: "Hot" },
  { image: prop2, titleKey: "landing.apartment",  price: "$185,000", beds: 2, score: 87, city: "Baghdad", tag: "New" },
  { image: prop3, titleKey: "landing.commercial", price: "$320,000", beds: 0, score: 78, city: "Mosul",   tag: null  },
];

const stats = [
  { value: "5,000+", label: "Active Investors" },
  { value: "12,000+", label: "Properties Listed" },
  { value: "98%",    label: "Valuation Accuracy" },
  { value: "3",      label: "Cities Covered" },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const features = [
    {
      icon: Sparkles,
      titleKey: "landing.smartDiscovery",
      descKey: "landing.smartDiscoveryDesc",
      gradient: "from-blue-500/20 to-indigo-500/10",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      titleKey: "landing.investorTools",
      descKey: "landing.investorToolsDesc",
      gradient: "from-amber-500/20 to-orange-500/10",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-500",
    },
    {
      icon: Shield,
      titleKey: "landing.secureTransactions",
      descKey: "landing.secureTransactionsDesc",
      gradient: "from-emerald-500/20 to-teal-500/10",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[60px]">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Building2 className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
            </div>
            <span className="text-lg font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              to="/auth"
              className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              {t("common.signIn")}
            </Link>
            <Link
              to="/auth?tab=signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-primary text-white shadow-primary hover:opacity-90 transition-all active:scale-95"
            >
              {t("common.getStarted")}
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-[60px] overflow-hidden min-h-[95svh] flex flex-col justify-end">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "150px",
        }} />

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          {/* Trust badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark text-white/90 text-xs font-semibold border border-white/15">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {t("landing.trustedBy", "Trusted by 5,000+ investors across Iraq")}
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-display-xl font-display font-bold text-white mb-5 leading-none max-w-3xl">
            {(() => {
              const parts = t("landing.heroTitle").split(",");
              return parts.length > 1
                ? <>{parts[0]},<br /><span className="text-gradient-gold">{parts.slice(1).join(",")}</span></>
                : <span className="text-gradient-gold">{t("landing.heroTitle")}</span>;
            })()}
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
            <Link
              to="/auth?tab=signup"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-primary text-white text-sm font-bold shadow-primary hover:opacity-90 transition-all active:scale-95"
            >
              {t("landing.exploreMarketplace")}
              <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl glass-dark text-white text-sm font-semibold border border-white/20 hover:border-white/40 transition-all active:scale-95"
            >
              {t("common.signIn")}
            </Link>
          </div>

          {/* City pills */}
          <div className="flex items-center flex-wrap gap-2">
            {["Erbil", "Baghdad", "Mosul", "Basra"].map(city => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark text-white/75 text-xs font-medium border border-white/10"
              >
                <MapPin className="w-3 h-3 text-primary" /> {city}
              </span>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative w-full glass-dark border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-4 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg sm:text-2xl font-display font-black text-white leading-none">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-white/50 mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20">
              <Zap className="w-3 h-3" />
              AI-Powered Platform
            </div>
            <h2 className="text-display-md font-display font-bold mb-4">
              {t("landing.whyAqarAI", "Why")} <span className="text-gradient-gold">AqarAI</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              {t("landing.whySubtitle", "Everything you need to navigate the real estate market with confidence.")}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div
                key={f.titleKey}
                className={`p-6 rounded-3xl border border-border/60 bg-gradient-to-br ${f.gradient} hover:border-primary/30 hover:-translate-y-1 hover:shadow-elevated transition-all duration-300 card-hover group`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-display font-bold mb-2.5 text-foreground">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
                <div className={`flex items-center gap-1.5 mt-4 text-xs font-semibold ${f.iconColor}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Learn more
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-display-md font-display font-bold">
                {t("landing.featuredProperties")}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">AI-scored properties in Iraq's top cities</p>
            </div>
            <Link
              to="/auth?tab=signup"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {t("common.viewAll")} <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {featuredProperties.map((p) => (
              <Link
                key={p.titleKey}
                to="/auth?tab=signup"
                className="rounded-3xl overflow-hidden bg-card border border-border shadow-card group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="relative h-52 sm:h-56 overflow-hidden">
                  <img
                    src={p.image}
                    alt={t(p.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Score badge */}
                  <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-dark text-xs font-black text-white border border-white/15`}>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.score}
                  </div>

                  {/* Tag */}
                  {p.tag && (
                    <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} px-2 py-1 rounded-lg text-[10px] font-bold ${
                      p.tag === "Hot" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                    }`}>
                      {p.tag}
                    </div>
                  )}

                  <div className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"}`}>
                    <p className="text-xl font-black text-white drop-shadow">{p.price}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-foreground mb-2">{t(p.titleKey)}</h3>
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" /> {p.city}
                    </p>
                    {p.beds > 0 && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bed className="w-3 h-3 shrink-0" /> {p.beds} {t("property.beds")}
                      </p>
                    )}
                  </div>
                  {/* AI Score bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground font-medium">AI Score</span>
                      <span className={`text-[10px] font-bold ${p.score >= 90 ? "text-emerald-500" : p.score >= 80 ? "text-amber-500" : "text-muted-foreground"}`}>{p.score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.score >= 90 ? "bg-emerald-500" : p.score >= 80 ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${p.score}%`, transition: "width 0.8s ease" }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/auth?tab=signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary/60 transition-all"
            >
              {t("common.viewAll")} <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social Proof / How it works ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-md font-display font-bold mb-3">
              How <span className="text-gradient-primary">It Works</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Three steps to smarter real estate decisions</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Search,     title: "Search & Discover",   desc: "Browse AI-curated listings across Iraq with smart filters." },
              { step: "02", icon: BarChart3,  title: "Analyze & Value",     desc: "Get instant AI valuations and investment scores for any property." },
              { step: "03", icon: CheckCircle2, title: "Offer & Close",     desc: "Send offers, manage negotiations, and close deals securely." },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center p-6 rounded-3xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-card transition-all">
                <div className="text-5xl font-black text-border mb-4 font-display leading-none">{step.step}</div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-gold shadow-gold mb-6 animate-float">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-display-md font-display font-bold mb-4">
            {t("landing.ctaTitle", "Ready to Get Started?")}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
            {t("landing.ctaSubtitle", "Join thousands of buyers and sellers on AqarAI today.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?tab=signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-primary text-white text-sm font-bold shadow-primary hover:opacity-90 transition-all active:scale-95"
            >
              {t("landing.ctaButton", "Create Free Account")}
              <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary/60 transition-all"
            >
              {t("common.pricing")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>
          <p className="text-xs text-muted-foreground">{t("landing.copyright", "© 2026 AqarAI. All rights reserved.")}</p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">{t("common.pricing")}</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">{t("support.title")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
