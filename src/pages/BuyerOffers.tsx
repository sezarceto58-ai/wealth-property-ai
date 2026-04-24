import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeDollarSign, Loader2 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { useMyOffers } from "@/hooks/useOffers";

const statusFilters = ["all", "SUBMITTED", "VIEWED", "ACCEPTED", "REJECTED", "COUNTERED", "EXPIRED", "WITHDRAWN"] as const;

export default function BuyerOffers() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "score">("date");
  const { data: offers = [], isLoading } = useMyOffers();

  const filtered = offers
    .filter((o) => filter === "all" || o.status === filter)
    .sort((a, b) => {
      if (sortBy === "price") return b.offer_price - a.offer_price;
      if (sortBy === "score") return b.seriousness_score - a.seriousness_score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: offers.length,
    pending: offers.filter((o) => o.status === "SUBMITTED" || o.status === "VIEWED").length,
    accepted: offers.filter((o) => o.status === "ACCEPTED").length,
    rejected: offers.filter((o) => o.status === "REJECTED").length,
  };

  const statusLabel = (s: string) => {
    if (s === "all") return t("offers.all");
    const key = s.toLowerCase() as keyof typeof import("@/i18n/en.json")["offer"];
    return t(`offer.${key}`, s);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BadgeDollarSign className="w-6 h-6 text-primary" /> {t("offers.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("offers.trackDesc")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">{t("offers.total")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-info">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">{t("offers.pending")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.accepted}</p>
          <p className="text-xs text-muted-foreground">{t("offers.accepted")}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">{t("offers.rejected")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1 overflow-x-auto">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {statusLabel(s)}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-foreground text-xs">
          <option value="date">{t("offers.sortByDate")}</option>
          <option value="price">{t("offers.sortByPrice")}</option>
          <option value="score">{t("offers.sortByScore")}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-card border border-border">
              <BadgeDollarSign className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t("offers.noMatch")}</p>
            </div>
          ) : filtered.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      )}
    </div>
  );
}
