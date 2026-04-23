import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Brain, MapPin, Bed, Bath, Maximize, Loader2, Building2 } from "lucide-react";
import PropertyAIAnalysis from "@/components/PropertyAIAnalysis";
import { useProperty } from "@/hooks/useProperties";
import property1 from "@/assets/property-1.jpg";

export default function BuyerPropertyAnalysis() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20 space-y-3">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">Property not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm underline">Go back</button>
      </div>
    );
  }

  const image = property.property_images?.[0]?.url ?? property1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/buyer/investor"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Investor Intelligence
      </Link>

      <header className="rounded-2xl bg-card border border-border p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <img
            src={image}
            alt={property.title}
            className="w-24 h-24 rounded-xl object-cover border border-border shrink-0"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> AI Analysis
            </p>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mt-1 leading-snug">
              {property.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {property.district}, {property.city}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>
              )}
              <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
              <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area}m²</span>
            </div>
            <p className="text-base font-bold text-foreground mt-2">
              ${property.price.toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      <PropertyAIAnalysis property={property} />
    </div>
  );
}
