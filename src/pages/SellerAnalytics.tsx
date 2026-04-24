import { useTranslation } from "react-i18next";
import { BarChart3, Eye, Users, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PlanGate from "@/components/PlanGate";
import { useMyProperties } from "@/hooks/useProperties";
import { useSellerOffers } from "@/hooks/useOffers";
import property1 from "@/assets/property-1.jpg";

function AnalyticsContent() {
  const { t } = useTranslation();
  const { data: properties = [], isLoading } = useMyProperties();
  const { data: offers = [] } = useSellerOffers();

  const totalViews = properties.reduce((s, p) => s + p.views, 0);
  const totalOfferValue = offers.reduce((s, o) => s + o.offer_price, 0);
  const topListings = [...properties].sort((a, b) => b.views - a.views);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title={t("seller.totalViews", "Total Views")}   value={totalViews.toLocaleString()} icon={Eye}       trend="up" change="+12% this month" />
        <StatsCard title={t("seller.totalOffers")}  value={offers.length}               icon={DollarSign} />
        <StatsCard title={t("seller.totalOfferValue")} value={`$${(totalOfferValue / 1000).toFixed(0)}K`} icon={TrendingUp} trend="up" />
        <StatsCard title={t("seller.activeListings", "Active Listings")} value={properties.filter(p => p.status === "active").length} icon={BarChart3} />
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{t("seller.topPerforming")}</h2>
        </div>
        {topListings.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{t("seller.noListingsAnalytics")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topListings.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                <img src={p.property_images?.[0]?.url ?? property1} alt={p.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.city} · ${p.price.toLocaleString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end"><Eye className="w-3.5 h-3.5 text-muted-foreground" />{p.views}</p>
                  <p className="text-xs text-muted-foreground">{offers.filter(o => o.property_id === p.id).length} {t("seller.offersCount")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SellerAnalytics() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> {t("seller.analyticsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("seller.analyticsSubtitle")}</p>
      </div>

      <PlanGate requiredTier="pro" featureLabel="Analytics Dashboard">
        <AnalyticsContent />
      </PlanGate>
    </div>
  );
}
