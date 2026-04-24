/**
 * AI Property Valuation — Property-Specific Only
 *
 * This page ONLY works when accessed with a specific property ID:
 *   /buyer/valuation/:id
 *
 * Without an ID it redirects to the property browser.
 * With an ID it loads the property and renders the gated AIValuationWidget.
 * The widget handles confirmation, gating and result — no manual form.
 */

import { useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Building2, Loader2, ArrowLeft } from "lucide-react";
import AIValuationWidget from "@/components/AIValuationWidget";
import { useProperty } from "@/hooks/useProperties";
import { propertyToValuationInput } from "@/services/propertyMapper";

// ── Slim back bar (property details now live inside the widget) ────────────

function BackBar({ backPath }: { backPath: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to={backPath}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4 shrink-0" /> {t("common.back")}
    </Link>
  );
}

// ── No-property gate ───────────────────────────────────────────────────────

function NoPropertyGate() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-6 px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <TrendingUp className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t("valuation.title")}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{t("valuation.noPropertyText")}</p>
      </div>
      <div className="rounded-xl bg-secondary/40 border border-border px-4 py-3 text-sm text-muted-foreground text-start">
        <p className="font-semibold text-foreground mb-1">{t("valuation.howToTitle")}</p>
      </div>
      <button
        onClick={() => navigate("/buyer/discover")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        {t("buyer.browseMarketplace")} →
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function AIValuationPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // No property ID → redirect to no-property gate
  const { data: property, isLoading } = useProperty(id);

  const rolePrefix = location.pathname.startsWith("/seller") ? "seller"
    : location.pathname.startsWith("/developer") ? "developer"
    : "buyer";

  const backPath = id ? `/property/${id}` : `/${rolePrefix}/discover`;

  // If no id provided, show the gate instead of the form
  if (!id) return <NoPropertyGate />;

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">{t("property.notFound")}</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm underline">{t("common.back")}</button>
      </div>
    );
  }

  const input = propertyToValuationInput(property);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      <PropertyHeader property={property} backPath={backPath} />
      <AIValuationWidget property={property} input={input} />
    </div>
  );
}
