import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, Heart, Bell, TrendingUp, DollarSign, Eye, Home,
  GitCompareArrows, BadgeDollarSign, Star, ArrowRight, MapPin, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "@/components/StatsCard";
import PropertyCard from "@/components/PropertyCard";
import { CardSkeleton, StatSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { useMyOffers } from "@/hooks/useOffers";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PLAN_LIMITS } from "@/hooks/usePlanLimits";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { data: properties = [], isLoading: propsLoading } = useProperties();
  const { data: myOffers = [] } = useMyOffers();
  const { data: favorites = [] } = useFavorites();
  const limits = usePlanLimits();

  const activeOffers = myOffers.filter((o) => o.status !== "REJECTED" && o.status !== "EXPIRED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t("buyer.dashboardTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("buyer.dashboardSubtitle")}</p>
      </div>

      {/* Quick actions */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/buyer/discover",   icon: Search,          label: t("nav.discover"),  color: "bg-primary/10 group-hover:bg-primary/20",       iconColor: "text-primary" },
          { to: "/buyer/favorites",  icon: Heart,           label: t("nav.favorites"), color: "bg-destructive/10 group-hover:bg-destructive/20", iconColor: "text-destructive" },
          { to: "/buyer/offers",     icon: BadgeDollarSign, label: t("nav.myOffers"),  color: "bg-success/10 group-hover:bg-success/20",         iconColor: "text-success" },
          { to: "/buyer/compare",    icon: GitCompareArrows,label: t("nav.compare"),   color: "bg-info/10 group-hover:bg-info/20",               iconColor: "text-info" },
        ].map((q) => (
          <motion.div key={q.to} variants={item}>
            <Link to={q.to} className="rounded-xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className={`p-3 rounded-xl ${q.color} transition-colors`}><q.icon className={`w-5 h-5 ${q.iconColor}`} /></div>
              <span className="text-sm font-medium text-foreground">{q.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats */}
      {propsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t("buyer.propertiesAvailable"), value: properties.length,     icon: Eye,            trend: "up" as const },
            { title: t("buyer.savedProperties"),     value: favorites.length,      icon: Heart,          trend: "up" as const,
              change: limits.tier === "free" ? `${favorites.length}/${PLAN_LIMITS.free.maxFavorites} free limit` : undefined },
            { title: t("buyer.activeOffers"),        value: activeOffers.length,   icon: BadgeDollarSign,trend: "up" as const,
              change: limits.tier === "free" ? `${limits.offersThisMonth}/3 this month` : undefined },
            { title: t("buyer.priceAlerts"),         value: "—",                   icon: Bell },
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
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">AI Property Valuation — Free for All</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get an instant AI-powered market value estimate and discount analysis for any property.
            <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">2 free uses included.</span>
          </p>
        </div>
        <Link
          to="/buyer/valuation"
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> Try AI Valuation
        </Link>
      </motion.div>

      {/* Recommended properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> Recommended For You
          </h2>
          <Link to="/buyer/discover" className="text-xs text-primary hover:underline flex items-center gap-1">
            {t("common.viewAll")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {propsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("buyer.noPropertiesYet")}
            description={t("buyer.noPropertiesDesc")}
            action={
              <Link to="/buyer/discover" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                <Search className="w-4 h-4" /> Browse Marketplace
              </Link>
            }
          />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {properties.slice(0, 4).map((property) => (
              <motion.div key={property.id} variants={item}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
