import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Maximize,
  BadgeCheck, MessageSquare, DollarSign, Loader2, TrendingUp,
} from "lucide-react";
import TerraScore from "@/components/TerraScore";
import InvestmentScore from "@/components/InvestmentScore";
import AIValuationWidget from "@/components/AIValuationWidget";
import OfferModal from "@/components/OfferModal";
import { useProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useUserRoles, getBestHomeRoute } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import property1 from "@/assets/property-1.jpg";

export default function PropertyDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { t }      = useTranslation();
  const { data: userRoles = [] } = useUserRoles();
  const rolePrefix = getBestHomeRoute(userRoles).replace("/", "");

  const [showOffer, setShowOffer]     = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked]             = useState(false);
  const toggleFav = useToggleFavorite();
  const { data: property, isLoading } = useProperty(id);

  useEffect(() => {
    if (id) supabase.rpc("increment_property_views", { p_property_id: id });
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!property) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-muted-foreground">{t("property.notFound")}</p>
        <Link to="/buyer/discover" className="text-primary text-sm underline">{t("property.backToMarket")}</Link>
      </div>
    );
  }

  const images = property.property_images?.map(i => i.url) ?? [property1];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t("property.linkCopied") });
    } catch { toast({ title: t("common.share"), description: window.location.href }); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Link to="/buyer/discover" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t("property.backToMarket")}
      </Link>

      {/* Gallery */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="relative aspect-[16/9] lg:aspect-[21/9]">
          <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                setLiked(!liked);
                toggleFav.mutate(property.id);
                toast({ title: liked ? t("property.removedFromFavorites") : t("property.addedToFavorites") });
              }}
              className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all ${liked ? "bg-red-500/90 border-red-400 text-white" : "bg-white/20 border-white/30 text-white hover:bg-white/30"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button onClick={handleShare} className="p-2.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {property.verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold">
              <BadgeCheck className="w-3.5 h-3.5" /> {t("common.verified")}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 p-2 bg-card">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? "border-primary" : "border-transparent opacity-50 hover:opacity-80"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{property.title}</h1>
              <p className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> {property.district}, {property.city}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" /> {property.bedrooms} {t("property.beds")}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" /> {property.bathrooms} {t("property.baths")}
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" /> {property.area} m²
              </span>
            </div>
            {property.description && <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>}
            {property.features?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {property.features.map(f => (
                  <span key={f} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{f}</span>
                ))}
              </div>
            )}
          </div>

          <AIValuationWidget
            property={property}
            input={{
              price: property.price, area: property.area ?? 150,
              bedrooms: property.bedrooms ?? 3, bathrooms: property.bathrooms ?? 2,
              city: property.city ?? "Erbil", district: property.district ?? "Ankawa",
              propertyType: property.property_type ?? "Apartment",
              verified: property.verified ?? false, features: property.features ?? [],
            }}
          />

          <InvestmentScore
            input={{
              price: property.price, aiValuation: property.ai_valuation ?? property.price,
              rentalYield: 7.5, city: property.city ?? "Erbil",
              district: property.district ?? "Ankawa",
              propertyType: property.property_type ?? "Apartment",
              developerRating: property.agent_verified ? 4.2 : 3.5,
              verified: property.verified ?? false,
            }}
          />

          <div className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{t("property.aqarScore")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("property.overallScore")}</p>
            </div>
            <TerraScore score={property.terra_score} size="lg" />
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="rounded-2xl bg-card border border-border p-5 space-y-5 lg:sticky lg:top-20">
            <div>
              <p className="text-3xl font-bold text-foreground">${property.price.toLocaleString()}</p>
              {property.price_iqd && <p className="text-sm text-muted-foreground mt-1">IQD {property.price_iqd.toLocaleString()}</p>}
              {property.ai_valuation && (
                <div className="mt-3 p-3 rounded-xl bg-secondary/40">
                  <p className="text-xs text-muted-foreground">{t("property.aiValuation")}</p>
                  <p className="text-lg font-bold text-foreground">${property.ai_valuation.toLocaleString()}</p>
                  <p className={`text-xs font-medium mt-0.5 ${property.ai_valuation > property.price ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {property.ai_valuation > property.price ? "▲" : "▼"}{" "}
                    {Math.abs(Math.round(((property.ai_valuation - property.price) / property.price) * 100))}% {t("property.discountVsMarket")}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setShowOffer(true)}
                className="w-full py-3 rounded-xl bg-gradient-gold font-semibold text-sm text-white shadow-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> {t("property.sendOffer")}
              </button>
              <button
                onClick={() => navigate(`/${rolePrefix}/messages`)}
                className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary/40 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> {t("property.messageSeller")}
              </button>
              <button
                onClick={() => navigate(`/${rolePrefix}/analysis/${property.id}`)}
                className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors"
              >
                {t("property.fullAnalysis")} →
              </button>
              <button
                onClick={() => navigate(`/${rolePrefix}/valuation/${property.id}`)}
                className="w-full py-3 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/20 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 font-medium text-sm hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" /> {t("property.deepValuation")}
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">{t("property.listedBy")}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(property.agent_name || "?").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {property.agent_name || "—"}
                    {property.agent_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("common.verified")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOffer && <OfferModal property={property} onClose={() => setShowOffer(false)} />}
    </div>
  );
}
