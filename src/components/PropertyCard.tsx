import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, BadgeCheck } from "lucide-react";
import TerraScore from "./TerraScore";
import type { Property } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const PropertyCard = React.forwardRef<HTMLAnchorElement, { property: Property }>(
  ({ property }, ref) => {
    const { toast } = useToast();
    const [liked, setLiked] = React.useState(false);

    return (
      <Link
        ref={ref}
        to={`/property/${property.id}`}
        className="group block rounded-xl overflow-hidden bg-card border border-border shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            {property.verified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-semibold">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium capitalize">
              {property.type}
            </span>
          </div>

          <button
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              liked ? "bg-destructive/80 text-destructive-foreground" : "bg-background/40 text-foreground hover:text-primary"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
              toast({
                title: liked ? "Removed from favorites" : "Added to favorites",
                description: property.title,
              });
            }}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>

          <div className="absolute bottom-3 left-3">
            <p className="text-xl font-bold text-foreground">
              ${property.price.toLocaleString()}
            </p>
            {property.priceIQD && (
              <p className="text-xs text-muted-foreground">
                IQD {property.priceIQD.toLocaleString()}
              </p>
            )}
          </div>

          <div className="absolute bottom-3 right-3">
            <TerraScore score={property.terraScore} size="sm" showLabel={false} />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {property.title}
          </h3>
          <p className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {property.district}, {property.city}
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
            <span className="flex items-center gap-1">
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
