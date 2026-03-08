import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, Heart, Bell, TrendingUp, DollarSign, Eye, Home,
  GitCompareArrows, BadgeDollarSign, Star, ArrowRight, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "@/components/StatsCard";
import PropertyCard from "@/components/PropertyCard";
import { CardSkeleton, StatSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";
import { useMyOffers } from "@/hooks/useOffers";
import { useFavorites } from "@/hooks/useFavorites";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { data: properties = [], isLoading: propsLoading } = useProperties();
  const { data: myOffers = [] } = useMyOffers();
  const { data: favorites = [] } = useFavorites();

  const activeOffers = myOffers.filter((o) => o.status !== "REJECTED" && o.status !== "EXPIRED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t("buyer.dashboardTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("buyer.dashboardSubtitle")}</p>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/buyer/discover", icon: Search, label: t("nav.discover"), color: "bg-primary/10 group-hover:bg-primary/20", iconColor: "text-primary" },
          { to: "/buyer/favorites", icon: Heart, label: t("nav.favorites"), color: "bg-destructive/10 group-hover:bg-destructive/20", iconColor: "text-destructive" },
          { to: "/buyer/offers", icon: BadgeDollarSign, label: t("nav.myOffers"), color: "bg-success/10 group-hover:bg-success/20", iconColor: "text-success" },
          { to: "/buyer/compare", icon: GitCompareArrows, label: t("nav.compare"), color: "bg-info/10 group-hover:bg-info/20", iconColor: "text-info" },
        ].map((q) => (
          <motion.div key={q.to} variants={item}>
            <Link to={q.to} className="rounded-xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className={`p-3 rounded-xl ${q.color} transition-colors`}><q.icon className={`w-5 h-5 ${q.iconColor}`} /></div>
              <span className="text-sm font-medium text-foreground">{q.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {propsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Properties Available", value: properties.length, icon: Eye, trend: "up" as const },
            { title: "Saved Properties", value: favorites.length, icon: Heart, trend: "up" as const },
            { title: "Active Offers", value: activeOffers.length, icon: BadgeDollarSign, trend: "up" as const },
            { title: "Price Alerts", value: "—", icon: Bell },
          ].map((s) => (
            <motion.div key={s.title} variants={item}>
              <StatsCard {...s} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> Recommended For You
          </h2>
          <Link to="/buyer/discover" className="text-xs text-primary hover:underline flex items-center gap-1">{t("common.viewAll")} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {propsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No Properties Yet"
            description="Properties will appear here as they get listed on the marketplace."
            action={<Link to="/buyer/discover" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"><Search className="w-4 h-4" /> Browse Marketplace</Link>}
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
