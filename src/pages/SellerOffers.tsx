import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, ArrowUpDown, Loader2 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import StatsCard from "@/components/StatsCard";
import { useSellerOffers } from "@/hooks/useOffers";
import { BadgeDollarSign, TrendingUp, Users } from "lucide-react";

export default function SellerOffers() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<"score" | "price" | "date">("score");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: offers = [], isLoading } = useSellerOffers();

  const allStatuses = ["all", "SUBMITTED", "VIEWED", "ACCEPTED", "REJECTED", "COUNTERED"];

  const filtered = offers
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "score") return b.seriousness_score - a.seriousness_score;
      if (sortBy === "price") return b.offer_price - a.offer_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const highIntent = offers.filter((o) => o.seriousness_score >= 80).length;
  const totalValue = offers.reduce((s, o) => s + o.offer_price, 0);
  const avgScore = offers.length ? Math.round(offers.reduce((s, o) => s + o.seriousness_score, 0) / offers.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" /> {t("seller.offerInboxTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("seller.offerInboxDesc")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title={t("offers.total")} value={offers.length} icon={BadgeDollarSign} trend="up" />
        <StatsCard title={t("seller.activeLeads")} value={highIntent} icon={Users} trend="up" />
        <StatsCard title={t("offers.seriousnessScore")} value={avgScore} icon={TrendingUp} trend="up" />
        <StatsCard title={t("common.total")} value={`$${(totalValue / 1000).toFixed(0)}K`} icon={DollarSign} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-secondary rounded-xl p-1 overflow-x-auto">
          {allStatuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize ${statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {s === "all" ? t("common.all") : s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs">
          <option value="score">{t("seller.sortBySeriousness")}</option>
          <option value="price">{t("seller.sortByOfferPrice")}</option>
          <option value="date">{t("seller.sortByDate")}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-card border border-border">
              <DollarSign className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t("seller.noOffersFilter")}</p>
            </div>
          ) : filtered.map((offer) => <OfferCard key={offer.id} offer={offer} showActions />)}
        </div>
      )}
    </div>
  );
}
