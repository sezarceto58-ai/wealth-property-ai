import { useState } from "react";
import { BadgeDollarSign, Loader2 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { useMyOffers } from "@/hooks/useOffers";

const statusFilters = ["all", "SUBMITTED", "VIEWED", "ACCEPTED", "REJECTED", "COUNTERED", "EXPIRED", "WITHDRAWN"] as const;

export default function BuyerOffers() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BadgeDollarSign className="w-6 h-6 text-primary" /> My Offers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your submitted offers and their responses.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Offers</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-info">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.accepted}</p>
          <p className="text-xs text-muted-foreground">Accepted</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1 overflow-x-auto">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize ${filter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-foreground text-xs">
          <option value="date">Sort by Date</option>
          <option value="price">Sort by Price</option>
          <option value="score">Sort by Score</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-card border border-border">
              <BadgeDollarSign className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No offers match this filter.</p>
            </div>
          ) : filtered.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      )}
    </div>
  );
}
