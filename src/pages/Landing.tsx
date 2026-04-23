import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Search, TrendingUp, Shield, ArrowRight, Star, MapPin, Bed } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-property.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const featuredProperties = [
  { image: prop1, titleKey: "landing.villa",      price: "$450,000", beds: 4, score: 92, city: "Erbil" },
  { image: prop2, titleKey: "landing.apartment",  price: "$185,000", beds: 2, score: 87, city: "Baghdad" },
  { image: prop3, titleKey: "landing.commercial", price: "$320,000", beds: 0, score: 78, city: "Mosul"  },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const features = [
    { icon: Search,    titleKey: "landing.smartDiscovery",    descKey: "landing.smartDiscoveryDesc"    },
    { icon: TrendingUp,titleKey: "landing.investorTools",     descKey: "landing.investorToolsDesc"     },
    { icon: Shield,    titleKey: "landing.secureTransactions",descKey: "landing.secureTransactionsDesc"},
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?tab=signup">{t("common.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-16 overflow-hidden min-h-[92svh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            {t("landing.trustedBy", "Trusted by 5,000+ investors across Iraq")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight tracking-tight">
            {(() => {
              const parts = t("landing.heroTitle").split(",");
              return parts.length > 1
                ? <>{parts[0]}, <span className="text-gradient-gold">{parts.slice(1).join(",")}</span></>
                : <span className="text-gradient-gold">{t("landing.heroTitle")}</span>;
            })()}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 shadow-gold">
              <Link to="/auth?tab=signup">
                {t("landing.exploreMarketplace")}
                <ArrowRight className={`w-4 h-4 ms-2 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-12 text-xs text-muted-foreground">
            {["Erbil", "Baghdad", "Mosul", "Basra"].map(city => (
              <span key={city} className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              {t("landing.whyAqarAI", "Why")} <span className="text-gradient-gold">AqarAI</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              {t("landing.whySubtitle", "Everything you need to navigate the real estate market with confidence.")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {features.map((f, i) => (
              <div
                key={f.titleKey}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2 text-foreground">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-card/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-12">
            {t("landing.featuredProperties")}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {featuredProperties.map((p) => (
              <div key={p.titleKey} className="rounded-2xl overflow-hidden bg-card border border-border shadow-card group hover:shadow-elevated hover:border-primary/20 transition-all duration-300">
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <img
                    src={p.image}
                    alt={t(p.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-bold text-primary`}>
                    <Star className="w-3 h-3 fill-current" /> {p.score}
                  </div>
                  <div className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"}`}>
                    <p className="text-base font-bold text-foreground drop-shadow">{p.price}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground mb-1.5">{t(p.titleKey)}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3 shrink-0" /> {p.city}
                  </p>
                  {p.beds > 0 && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bed className="w-3 h-3 shrink-0" /> {p.beds} {t("property.beds")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/auth?tab=signup">
                {t("common.viewAll")}
                <ArrowRight className={`w-4 h-4 ms-2 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold shadow-gold mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            {t("landing.ctaTitle", "Ready to Get Started?")}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            {t("landing.ctaSubtitle", "Join thousands of buyers and sellers on AqarAI today.")}
          </p>
          <Button size="lg" asChild className="text-base px-10 shadow-gold">
            <Link to="/auth?tab=signup">{t("landing.ctaButton", "Create Free Account")}</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>
          <p className="text-xs text-muted-foreground">{t("landing.copyright", "© 2026 AqarAI. All rights reserved.")}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">{t("common.pricing")}</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">{t("support.title")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
