import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Maximize, BadgeCheck,
  TrendingUp, MessageSquare, DollarSign, Eye, Users,
} from "lucide-react";
import TerraScore from "@/components/TerraScore";
import OfferModal from "@/components/OfferModal";
import { mockProperties, terraScoreBreakdown } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showOffer, setShowOffer] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);

  const property = mockProperties.find((p) => p.id === id);
  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found.</p>
        <Link to="/buyer/discover" className="text-primary text-sm mt-2 inline-block">Back to marketplace</Link>
      </div>
    );
  }

  const valuationDiff = property.aiValuation - property.price;
  const valuationPercent = Math.round((valuationDiff / property.price) * 100);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Property link has been copied to clipboard." });
    } catch {
      toast({ title: "Share", description: url });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/buyer/discover" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Link>

      {/* Images */}
      <div className="rounded-xl overflow-hidden mb-6">
        <div className="relative aspect-[16/9] lg:aspect-[2/1]">
          <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                setLiked(!liked);
                toast({ title: liked ? "Removed from favorites" : "Added to favorites" });
              }}
              className={`p-2.5 rounded-lg backdrop-blur-sm transition-colors ${liked ? "bg-destructive/80 text-destructive-foreground" : "bg-background/40 text-foreground hover:text-primary"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button onClick={handleShare} className="p-2.5 rounded-lg bg-background/40 backdrop-blur-sm text-foreground hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {property.images.length > 1 && (
          <div className="flex gap-2 mt-2">
            {property.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">{property.title}</h1>
                <p className="flex items-center gap-1 mt-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {property.district}, {property.city}</p>
              </div>
              {property.verified && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                  <BadgeCheck className="w-4 h-4" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              {property.bedrooms > 0 && <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {property.bedrooms} Beds</span>}
              <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {property.bathrooms} Baths</span>
              <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4" /> {property.area}m²</span>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {property.features.map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{f}</span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">TerraScore™ Breakdown</h3>
              <TerraScore score={property.terraScore} size="md" />
            </div>
            <div className="space-y-3">
              {Object.entries(terraScoreBreakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-foreground font-medium">{val}/25</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${(val / 25) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{property.views.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{property.leads}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{property.aiConfidence}</p>
              <p className="text-xs text-muted-foreground">AI Confidence</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-5 shadow-card sticky top-20">
            <p className="text-3xl font-bold text-foreground">${property.price.toLocaleString()}</p>
            {property.priceIQD && <p className="text-sm text-muted-foreground mt-1">IQD {property.priceIQD.toLocaleString()}</p>}

            <div className="mt-4 p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">AI Valuation</p>
              <p className="text-lg font-bold text-foreground">${property.aiValuation.toLocaleString()}</p>
              <p className={`text-xs font-medium ${valuationDiff >= 0 ? "text-success" : "text-destructive"}`}>
                {valuationDiff >= 0 ? "+" : ""}${valuationDiff.toLocaleString()} ({valuationPercent > 0 ? "+" : ""}{valuationPercent}%)
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => setShowOffer(true)}
                className="w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> Send Offer (Pro+)
              </button>
              <button
                onClick={() => navigate("/buyer/messages")}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Message Seller
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Listed by</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {property.agentName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {property.agentName}
                    {property.agentVerified && <BadgeCheck className="w-3 h-3 text-primary" />}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="font-semibold text-foreground mb-2">AI Analysis Results</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Open full AI investment analysis in a dedicated page for deeper insights.
            </p>
            <button
              onClick={() => navigate(`/buyer/analysis/${property.id}`)}
              className="w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity"
            >
              Open AI Analysis Page
            </button>
          </div>
        </div>
      </div>

      {showOffer && <OfferModal property={property} onClose={() => setShowOffer(false)} />}
    </div>
  );
}
