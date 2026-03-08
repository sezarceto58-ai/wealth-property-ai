import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2, Eye, Users, TrendingUp, DollarSign, Plus, BadgeDollarSign,
  MessageSquare, BarChart3, ArrowRight, UserCheck, Loader2,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import OfferCard from "@/components/OfferCard";
import { useMyProperties } from "@/hooks/useProperties";
import { useSellerOffers } from "@/hooks/useOffers";
import { useLeads } from "@/hooks/useLeads";

export default function SellerDashboard() {
  const { t } = useTranslation();
  const { data: properties = [], isLoading } = useMyProperties();
  const { data: offers = [] } = useSellerOffers();
  const { data: leads = [] } = useLeads();

  const pendingOffers = offers.filter((o) => o.status === "SUBMITTED" || o.status === "VIEWED");
  const newLeads = leads.filter((l) => l.stage === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("seller.dashboardTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("seller.dashboardSubtitle")}</p>
        </div>
        <Link to="/seller/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-gold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> {t("nav.newListing")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Listings" value={properties.length} icon={Building2} trend="up" />
        <StatsCard title="Total Views" value={properties.reduce((s, p) => s + p.views, 0).toLocaleString()} icon={Eye} trend="up" />
        <StatsCard title="Active Leads" value={leads.length} icon={Users} trend="up" />
        <StatsCard title="Pending Offers" value={pendingOffers.length} icon={BadgeDollarSign} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> {t("nav.offerInbox")}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{pendingOffers.length}</span>
            </h2>
            <Link to="/seller/offers" className="text-xs text-primary hover:underline flex items-center gap-1">{t("common.viewAll")} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4">
              {pendingOffers.slice(0, 2).map((offer) => <OfferCard key={offer.id} offer={offer} showActions />)}
              {pendingOffers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending offers</p>}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link to="/seller/listings" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("nav.myListings")}</p>
                <p className="text-xs text-muted-foreground">{properties.length} active</p>
              </div>
            </Link>
            <Link to="/seller/crm" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block">
              <Users className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("nav.crmLeads")}</p>
                <p className="text-xs text-muted-foreground">{newLeads} new leads</p>
              </div>
            </Link>
            <Link to="/seller/messages" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block">
              <MessageSquare className="w-5 h-5 text-warning" />
              <div><p className="text-sm font-medium text-foreground">{t("common.messages")}</p></div>
            </Link>
            <Link to="/seller/analytics" className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block">
              <BarChart3 className="w-5 h-5 text-info" />
              <div><p className="text-sm font-medium text-foreground">{t("nav.analytics")}</p></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
