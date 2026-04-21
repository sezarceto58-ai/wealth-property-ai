import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Search, TrendingUp, Shield, ArrowRight, Star } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-property.jpg";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

const featuredProperties = [
  { image: prop1, titleKey: "landing.villa", price: "$450,000", beds: 4, score: 92 },
  { image: prop2, titleKey: "landing.apartment", price: "$185,000", beds: 2, score: 87 },
  { image: prop3, titleKey: "landing.commercial", price: "$320,000", beds: 0, score: 78 },
];

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Search, titleKey: "landing.smartDiscovery", descKey: "landing.smartDiscoveryDesc" },
    { icon: TrendingUp, titleKey: "landing.investorTools", descKey: "landing.investorToolsDesc" },
    { icon: Shield, titleKey: "landing.secureTransactions", descKey: "landing.secureTransactionsDesc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-gradient-gold">TerraVista</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" asChild>
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">{t("common.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            {t("landing.heroTitle").split(",")[0]}
            <span className="text-gradient-gold">{t("landing.heroTitle").split(",")[1] || ""}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/auth?tab=signup">
                {t("landing.exploreMarketplace")} <ArrowRight className="ml-2 w-4 h-4 rtl-flip" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            {t("landing.whyTerraVista", "Why")} <span className="text-gradient-gold">TerraVista</span>?
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            {t("landing.whySubtitle", "Everything you need to navigate the real estate market with confidence.")}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.titleKey}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors shadow-card"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-14">
            {t("landing.featuredProperties")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProperties.map((p) => (
              <div key={p.titleKey} className="rounded-xl overflow-hidden bg-card border border-border shadow-card group">
                <div className="relative h-52 overflow-hidden">
                  <img src={p.image} alt={t(p.titleKey)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-semibold text-primary">
                    <Star className="w-3 h-3" /> {p.score}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-foreground mb-1">{t(p.titleKey)}</h3>
                  <p className="text-primary font-bold text-lg">{p.price}</p>
                  {p.beds > 0 && <p className="text-muted-foreground text-xs mt-1">{p.beds} {t("property.beds")}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link to="/auth?tab=signup">{t("common.viewAll")} <ArrowRight className="ml-2 w-4 h-4 rtl-flip" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t("landing.ctaTitle", "Ready to Get Started?")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("landing.ctaSubtitle", "Join thousands of buyers and sellers on TerraVista today.")}
          </p>
          <Button size="lg" asChild className="text-base px-10">
            <Link to="/auth?tab=signup">{t("landing.ctaButton", "Create Free Account")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-gradient-gold">TerraVista</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("landing.copyright", "© 2026 TerraVista. All rights reserved.")}</p>
        </div>
      </footer>
    </div>
  );
}
