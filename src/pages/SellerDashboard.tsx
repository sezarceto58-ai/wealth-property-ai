import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Building2, Eye, Users, TrendingUp, DollarSign, Plus, BadgeDollarSign,
  MessageSquare, BarChart3, ArrowRight, UserCheck, Loader2, Package,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import OfferCard from "@/components/OfferCard";
import { StatSkeleton, ListSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import { useMyProperties } from "@/hooks/useProperties";
import { useSellerOffers } from "@/hooks/useOffers";
import { useLeads } from "@/hooks/useLeads";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Active Listings", value: properties.length, icon: Building2, trend: "up" as const },
            { title: "Total Views", value: properties.reduce((s, p) => s + p.views, 0).toLocaleString(), icon: Eye, trend: "up" as const },
            { title: "Active Leads", value: leads.length, icon: Users, trend: "up" as const },
            { title: "Pending Offers", value: pendingOffers.length, icon: BadgeDollarSign, trend: "up" as const },
          ].map((s) => (
            <motion.div key={s.title} variants={item}>
              <StatsCard {...s} />
            </motion.div>
          ))}
        </motion.div>
      )}

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
            <ListSkeleton rows={2} />
          ) : pendingOffers.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Pending Offers"
              description="When buyers submit offers on your listings, they'll appear here for you to review."
            />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4">
              {pendingOffers.slice(0, 2).map((offer) => (
                <motion.div key={offer.id} variants={item}>
                  <OfferCard offer={offer} showActions />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {[
              { to: "/seller/listings", icon: Building2, color: "text-primary", label: t("nav.myListings"), sub: `${properties.length} active` },
              { to: "/seller/crm", icon: Users, color: "text-success", label: t("nav.crmLeads"), sub: `${newLeads} new leads` },
              { to: "/seller/messages", icon: MessageSquare, color: "text-warning", label: t("common.messages"), sub: null },
              { to: "/seller/analytics", icon: BarChart3, color: "text-info", label: t("nav.analytics"), sub: null },
            ].map((link) => (
              <motion.div key={link.to} variants={item}>
                <Link to={link.to} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all block">
                  <link.icon className={`w-5 h-5 ${link.color}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    {link.sub && <p className="text-xs text-muted-foreground">{link.sub}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
