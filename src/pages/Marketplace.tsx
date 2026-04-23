import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, MapPin, Loader2, Map as MapIcon, LayoutGrid } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import heroImg from "@/assets/hero-property.jpg";

const MarketplaceMap = lazy(() => import("@/components/MarketplaceMap"));

export default function Marketplace() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode]         = useState<"grid" | "map">("grid");

  const { data: properties = [], isLoading } = useProperties({
    city: selectedCity, type: selectedType, search: searchQuery,
  });

  const cities = ["all", "Erbil", "Baghdad", "Basra", "Sulaymaniyah"];
  const types  = ["all", "Villa", "Apartment", "Commercial", "Penthouse"];

  return (
    <div className="-m-4 lg:-m-6">
      {/* Hero */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={heroImg} alt="AqarAI" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gradient-gold mb-2">
            {t("marketplace.title")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            {t("marketplace.subtitle")}
          </p>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("marketplace.searchPlaceholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c === "all" ? t("marketplace.allCities") : c}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm"
            >
              {types.map(tp => (
                <option key={tp} value={tp}>{tp === "all" ? t("marketplace.allTypes") : tp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{properties.length}</span>{" "}
            {t("marketplace.propertiesFound", { count: properties.length })}
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
              <SlidersHorizontal className="w-3 h-3" /> {t("marketplace.filters")}
            </button>
            <div className="rounded-lg border border-border bg-card p-1 flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <MapIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "map" ? (
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <MarketplaceMap properties={properties} />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map(property => <PropertyCard key={property.id} property={property} />)}
          </div>
        )}

        {!isLoading && properties.length === 0 && (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">{t("marketplace.noMatch")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
