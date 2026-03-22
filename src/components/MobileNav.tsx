/**
 * MobileNav — fixed bottom navigation bar shown on small screens only.
 */
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Search, Heart, BadgeDollarSign,
  BarChart3, Building2, Briefcase, TrendingUp,
} from "lucide-react";
import { useUserRoles, getBestHomeRoute } from "@/hooks/useUserRoles";

interface NavItem { path: string; icon: React.ElementType; labelKey: string; }

const buyerItems: NavItem[] = [
  { path: "/buyer",          icon: LayoutDashboard, labelKey: "nav.home"      },
  { path: "/buyer/discover", icon: Search,           labelKey: "nav.discover"  },
  { path: "/buyer/favorites",icon: Heart,            labelKey: "nav.favorites" },
  { path: "/buyer/offers",   icon: BadgeDollarSign,  labelKey: "nav.myOffers"  },
  { path: "/buyer/market-intelligence", icon: BarChart3, labelKey: "nav.marketIntelligence" },
];

const sellerItems: NavItem[] = [
  { path: "/seller",          icon: LayoutDashboard, labelKey: "nav.home"     },
  { path: "/seller/listings", icon: Building2,       labelKey: "nav.listings" },
  { path: "/seller/offers",   icon: BadgeDollarSign, labelKey: "nav.offerInbox" },
  { path: "/seller/analytics",icon: BarChart3,       labelKey: "nav.analytics"},
  { path: "/seller/crm",      icon: BadgeDollarSign, labelKey: "nav.crmLeads" },
];

const developerItems: NavItem[] = [
  { path: "/developer",              icon: LayoutDashboard, labelKey: "nav.home"     },
  { path: "/developer/opportunities",icon: Briefcase,       labelKey: "nav.opportunities" },
  { path: "/developer/analyze",      icon: Search,          labelKey: "nav.analyzeLand"  },
  { path: "/developer/portfolio",    icon: TrendingUp,      labelKey: "nav.portfolioInsights"},
  { path: "/developer/market-intelligence", icon: BarChart3, labelKey: "nav.marketIntelligence" },
];

export default function MobileNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: roles = [] } = useUserRoles();

  let items = buyerItems;
  if (location.pathname.startsWith("/seller"))    items = sellerItems;
  if (location.pathname.startsWith("/developer")) items = developerItems;

  return (
    <nav className="mobile-bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : ""}`}>
                {t(item.labelKey)}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
