import { Heart, Trash2, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropertyCard from "@/components/PropertyCard";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PLAN_LIMITS } from "@/hooks/usePlanLimits";

export default function BuyerFavorites() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: favorites = [], isLoading } = useFavorites();
  const toggleFav = useToggleFavorite();
  const limits = usePlanLimits();

  const removeFavorite = (id: string) => {
    toggleFav.mutate(id);
    toast({ title: t("favorites.removedFromFavorites") });
  };

  const isFree = limits.tier === "free";
  const limitReached = isFree && favorites.length >= PLAN_LIMITS.free.maxFavorites;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-destructive" /> {t("favorites.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("favorites.savedCount", { count: favorites.length })}
            {isFree && (
              <span className="ml-2 text-xs">
                · <span className={limitReached ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {t("favorites.freeLimit", { count: favorites.length, max: PLAN_LIMITS.free.maxFavorites })}
                </span>
              </span>
            )}
          </p>
        </div>

        {isFree && (
          <div className={`rounded-xl border p-3 text-right max-w-xs ${
            limitReached
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-card"
          }`}>
            {limitReached ? (
              <>
                <p className="text-xs font-semibold text-destructive">{t("favorites.limitUsed")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("favorites.upgradeUnlimited")}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {t("favorites.remaining", { count: limits.favoritesRemaining, max: PLAN_LIMITS.free.maxFavorites })}
                </p>
              </>
            )}
            <button
              onClick={() => navigate("/pricing")}
              className="mt-2 px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 ml-auto"
            >
              <Lock className="w-3 h-3" /> {t("favorites.upgrade")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">{t("favorites.totalSaved")}</p>
          <p className="text-xl font-bold text-foreground mt-1">{favorites.length}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">{t("favorites.avgPrice")}</p>
          <p className="text-xl font-bold text-foreground mt-1">
            ${favorites.length ? Math.round(favorites.reduce((s, p) => s + p.price, 0) / favorites.length / 1000) : 0}K
          </p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">{t("favorites.avgScore")}</p>
          <p className="text-xl font-bold text-success mt-1">
            {favorites.length ? Math.round(favorites.reduce((s, p) => s + p.terra_score, 0) / favorites.length) : 0}
          </p>
        </div>
      </div>

      {limitReached && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t("favorites.limitReachedTitle")}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {t("favorites.limitReachedDesc")}
            </p>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
          >
            {t("favorites.upgrade")}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-card border border-border">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">{t("favorites.noFavorites")}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">{t("favorites.noFavoritesDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} />
              <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => { e.preventDefault(); removeFavorite(property.id); }}
                  className="p-2 rounded-lg bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
