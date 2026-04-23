import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Building2, Eye, Users, TrendingUp, DollarSign, Plus, BadgeDollarSign,
  MessageSquare, BarChart3, ArrowRight, UserCheck, Loader2, Package, Sparkles,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("seller.dashboardTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("seller.dashboardSubtitle")}</p>
        </div>
        <Link
          to="/seller/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-white text-sm font-semibold shadow-gold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> {t("nav.newListing")}
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t("seller.activeListings"),  value: properties.length,                                           icon: Building2,     trend: "up" as const },
            { title: t("seller.totalViews"),      value: properties.reduce((s, p) => s + p.views, 0).toLocaleString(),icon: Eye,           trend: "up" as const },
            { title: t("seller.activeLeads"),     value: leads.length,                                                icon: Users,         trend: "up" as const },
            { title: t("seller.pendingOffers"),   value: pendingOffers.length,                                        icon: BadgeDollarSign,trend: "up" as const },
          ].map((s) => (
            <motion.div key={s.title} variants={item}>
              <StatsCard {...s} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── AI Valuation Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 via-transparent to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{t("seller.validatePrice")}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("seller.validatePriceDesc")}
            <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">{t("seller.freeUsesIncluded")}</span>
          </p>
        </div>
        <Link
          to="/seller/valuation"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> {t("seller.checkPrice")}
        </Link>
      </motion.div>

      {/* Main content: offers + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> {t("nav.offerInbox")}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{pendingOffers.length}</span>
            </h2>
            <Link to="/seller/offers" className="text-xs text-primary hover:underline flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <ListSkeleton rows={2} />
          ) : pendingOffers.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("seller.noPendingOffers")}
              description={t("seller.noPendingOffersDesc")}
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
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("seller.quickLinks")}</h2>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {[
              { to: "/seller/listings",  icon: Building2,    color: "text-primary",     label: t("nav.myListings"),   sub: t("seller.activeCount", { count: properties.length }) },
              { to: "/seller/crm",       icon: Users,        color: "text-success",     label: t("nav.crmLeads"),     sub: t("seller.newLeadsCount", { count: newLeads }) },
              { to: "/seller/messages",  icon: MessageSquare,color: "text-warning",     label: t("common.messages"), sub: null },
              { to: "/seller/analytics", icon: BarChart3,    color: "text-info",        label: t("nav.analytics"),   sub: null },
            ].map((link) => (
              <motion.div key={link.to} variants={item}>
                <Link to={link.to} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all">
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
