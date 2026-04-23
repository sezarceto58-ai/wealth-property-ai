import { Building2, Eye, Users, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import OfferCard from "@/components/OfferCard";
import { useSellerOffers } from "@/hooks/useOffers";
import { useMyProperties } from "@/hooks/useProperties";

export default function AgentDashboard() {
  const { data: offers = [], isLoading } = useSellerOffers();
  const { data: properties = [] } = useMyProperties();
  const sellerOffers = offers.filter((o) => o.status === "SUBMITTED" || o.status === "VIEWED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your listings, leads, and offers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Listings" value={properties.length} icon={Building2} trend="up" />
        <StatsCard title="Total Views" value={properties.reduce((s, p) => s + p.views, 0).toLocaleString()} icon={Eye} trend="up" />
        <StatsCard title="Pending Offers" value={sellerOffers.length} icon={Users} trend="up" />
        <StatsCard title="Total Offers" value={offers.length} icon={TrendingUp} trend="up" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Offer Inbox
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{sellerOffers.length}</span>
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {sellerOffers.map((offer) => <OfferCard key={offer.id} offer={offer} showActions />)}
            {sellerOffers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending offers</p>}
          </div>
        )}
      </div>
    </div>
  );
}
