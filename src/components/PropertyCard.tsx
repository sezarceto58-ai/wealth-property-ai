import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import TerraScore from "./TerraScore";
import type { DbProperty } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useToggleFavorite } from "@/hooks/useFavorites";
import property1 from "@/assets/property-1.jpg";

const PropertyCard = React.forwardRef<HTMLAnchorElement, { property: DbProperty }>(
  ({ property }, ref) => {
    const { toast, i18n } = { toast: useToast().toast, i18n: useTranslation().i18n };
    const [liked, setLiked] = React.useState(false);
    const toggleFav = useToggleFavorite();
    const isRTL = i18n.dir() === "rtl";

    const image = (property.property_images && property.property_images.length > 0)
      ? property.property_images[0].url
      : property1;

    return (
      <Link
        ref={ref}
        to={`/property/${property.id}`}
        className="group block rounded-2xl overflow-hidden bg-card border border-border shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Top badges — use logical start/end instead of left/right */}
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} flex gap-1.5`}>
            {property.verified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/90 text-primary-foreground text-[11px] font-semibold shadow-sm">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="px-2 py-1 rounded-lg bg-background/70 backdrop-blur-sm text-foreground text-[11px] font-medium capitalize shadow-sm">
              {property.type}
            </span>
          </div>

          {/* Favorite button */}
          <button
            className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} p-2.5 rounded-full backdrop-blur-sm transition-all ${
              liked
                ? "bg-destructive/80 text-destructive-foreground"
                : "bg-background/50 text-foreground hover:bg-background/80 hover:text-primary"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
              toggleFav.mutate(property.id);
              toast({
                title: liked ? "Removed from favorites" : "Added to favorites",
                description: property.title,
              });
            }}
            aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>

          {/* Price */}
          <div className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"}`}>
            <p className="text-xl font-bold text-foreground drop-shadow-sm">
              ${property.price.toLocaleString()}
            </p>
            {property.price_iqd && (
              <p className="text-xs text-muted-foreground">IQD {property.price_iqd.toLocaleString()}</p>
            )}
          </div>

          {/* TerraScore */}
          <div className={`absolute bottom-3 ${isRTL ? "left-3" : "right-3"}`}>
            <TerraScore score={property.terra_score} size="sm" showLabel={false} />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-snug">
            {property.title}
          </h3>
          <p className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{property.district}, {property.city}</span>
          </p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" /> {property.bedrooms}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1 ms-auto">
              <Maximize className="w-3.5 h-3.5" /> {property.area}m²
            </span>
          </div>
        </div>
      </Link>
    );
  }
);

PropertyCard.displayName = "PropertyCard";
export default PropertyCard;
