/**
 * MobileNav — Premium fixed bottom navigation bar for mobile.
 * Floating pill style with active indicator, haptic-ready tap targets.
 * Fully RTL-aware.
 */
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Search, Heart, BadgeDollarSign,
  BarChart3, Building2, Briefcase, TrendingUp, Users, Plus,
} from "lucide-react";

interface NavItem { path: string; icon: React.ElementType; labelKey: string; }

const buyerItems: NavItem[] = [
  { path: "/buyer",                     icon: LayoutDashboard, labelKey: "nav.home"    },
  { path: "/buyer/discover",            icon: Search,          labelKey: "nav.discover" },
  { path: "/buyer/favorites",           icon: Heart,           labelKey: "nav.favorites"},
  { path: "/buyer/offers",              icon: BadgeDollarSign, labelKey: "nav.myOffers" },
  { path: "/buyer/market-intelligence", icon: BarChart3,       labelKey: "nav.market"   },
];

const sellerItems: NavItem[] = [
  { path: "/seller",           icon: LayoutDashboard, labelKey: "nav.home"      },
  { path: "/seller/listings",  icon: Building2,       labelKey: "nav.listings"  },
  { path: "/seller/create",    icon: Plus,            labelKey: "nav.newListing"},
  { path: "/seller/offers",    icon: BadgeDollarSign, labelKey: "nav.offerInbox"},
  { path: "/seller/crm",       icon: Users,           labelKey: "nav.crmLeads"  },
];

const developerItems: NavItem[] = [
  { path: "/developer",               icon: LayoutDashboard, labelKey: "nav.home"         },
  { path: "/developer/opportunities", icon: Briefcase,       labelKey: "nav.opportunities" },
  { path: "/developer/analyze",       icon: Search,          labelKey: "nav.analyzeLand"   },
  { path: "/developer/portfolio",     icon: TrendingUp,      labelKey: "nav.portfolioInsights"},
  { path: "/developer/market-intelligence", icon: BarChart3, labelKey: "nav.marketIntelligence"},
];

export default function MobileNav() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  let items = buyerItems;
  if (location.pathname.startsWith("/seller"))    items = sellerItems;
  if (location.pathname.startsWith("/developer")) items = developerItems;

  const displayItems = isRTL ? [...items].reverse() : items;

  return (
    <nav
      className="mobile-bottom-nav lg:hidden"
      dir={isRTL ? "rtl" : "ltr"}
      aria-label="Main navigation"
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-1">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/buyer" && item.path !== "/seller" && item.path !== "/developer" &&
              location.pathname.startsWith(item.path + "/"));
          const isCenter = item.path.includes("/create") || item.path.includes("/analyze");

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 min-w-[52px] max-w-[68px] flex-1 transition-all duration-200 active:scale-90 ${isCenter ? "-mt-3" : ""}`}
            >
              <div className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 ${
                isCenter
                  ? "w-12 h-12 bg-gradient-primary shadow-primary"
                  : isActive
                  ? "w-10 h-10 bg-primary/10 dark:bg-primary/20"
                  : "w-10 h-10"
              }`}>
                <Icon className={`transition-all duration-200 ${
                  isCenter ? "w-5 h-5 text-white"
                  : isActive ? "w-5 h-5 text-primary"
                  : "w-5 h-5 text-muted-foreground"
                }`} />
              </div>
              <span className={`text-[9.5px] font-semibold leading-none text-center w-full truncate px-0.5 ${
                isCenter ? "text-primary" : isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {t(item.labelKey)}
              </span>
              {isActive && !isCenter ? <div className="nav-dot" /> : <div className="h-1" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
