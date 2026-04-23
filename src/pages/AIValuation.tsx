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
import {
  TrendingUp, MapPin, Building2, Bed, Bath, Maximize,
  BadgeCheck, Loader2, ArrowLeft, Sparkles,
} from "lucide-react";
import AIValuationWidget from "@/components/AIValuationWidget";
import { useProperty } from "@/hooks/useProperties";
import { propertyToValuationInput } from "@/services/propertyMapper";
import type { DbProperty } from "@/types/database";
import property1 from "@/assets/property-1.jpg";

// ── Property header card ───────────────────────────────────────────────────

function PropertyHeader({ property, backPath }: { property: DbProperty; backPath: string }) {
  const image = property.property_images?.[0]?.url ?? property1;
  const diffPct = property.ai_valuation
    ? Math.round(((property.ai_valuation - property.price) / property.price) * 100)
    : null;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <Link to={backPath} className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border">
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back to listing
      </Link>
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0">
          <img src={image} alt={property.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display font-bold text-foreground text-base sm:text-lg leading-snug line-clamp-2">
              {property.title}
            </h2>
            {property.verified && <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 shrink-0" />{property.district}, {property.city}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
            <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area}m²</span>
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Asking Price</p>
              <p className="text-base font-bold text-foreground">${property.price.toLocaleString()}</p>
            </div>
            {property.ai_valuation && diffPct !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Prior AI Estimate</p>
                <p className={`text-base font-bold ${diffPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  ${property.ai_valuation.toLocaleString()}
                  <span className="text-xs ms-1">({diffPct > 0 ? "+" : ""}{diffPct}%)</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-4 mb-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary">Property-specific valuation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This valuation is scoped exclusively to this listing. Confirm below to proceed.
          </p>
        </div>
      </div>
    </div>
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
        <h1 className="text-2xl font-display font-bold text-foreground">AI Property Valuation</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Valuation is available on a per-property basis. Browse the marketplace,
          open a specific listing, then tap <strong>Deep AI Valuation</strong> to proceed.
        </p>
      </div>
      <div className="rounded-xl bg-secondary/40 border border-border px-4 py-3 text-sm text-muted-foreground text-start">
        <p className="font-semibold text-foreground mb-1">How to get a valuation:</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>Browse properties in the marketplace</li>
          <li>Open a specific property listing</li>
          <li>Scroll to <em>AI Valuation</em> and click <em>Request Valuation</em></li>
          <li>Confirm the property and get your result</li>
        </ol>
      </div>
      <button
        onClick={() => navigate("/buyer/discover")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        Browse Properties →
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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">Property not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm underline">Go back</button>
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
