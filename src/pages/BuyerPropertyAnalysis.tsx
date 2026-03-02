import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Brain, MapPin } from "lucide-react";
import PropertyAIAnalysis from "@/components/PropertyAIAnalysis";
import { mockProperties } from "@/data/mockData";

export default function BuyerPropertyAnalysis() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found.</p>
        <Link to="/buyer/investor" className="text-primary text-sm mt-2 inline-block">Back to Investor Intelligence</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/buyer/investor" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Investor Intelligence
      </Link>

      <header className="rounded-2xl bg-card border border-border p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <img
            src={property.image}
            alt={property.title}
            className="w-24 h-24 rounded-xl object-cover border border-border"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> AI Analysis Page
            </p>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">{property.title}</h1>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {property.district}, {property.city}
            </p>
            <p className="text-sm text-foreground font-semibold mt-2">${property.price.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <PropertyAIAnalysis property={property} />
    </div>
  );
}
