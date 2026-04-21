/**
 * MobileNav — fixed bottom navigation bar shown on small screens only.
 * Fully RTL-aware with reactive language detection.
 */
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Search, Heart, BadgeDollarSign,
  BarChart3, Building2, Briefcase, TrendingUp, Users,
} from "lucide-react";

interface NavItem { path: string; icon: React.ElementType; labelKey: string; }

const buyerItems: NavItem[] = [
  { path: "/buyer",                    icon: LayoutDashboard, labelKey: "nav.home"              },
  { path: "/buyer/discover",           icon: Search,          labelKey: "nav.discover"          },
  { path: "/buyer/favorites",          icon: Heart,           labelKey: "nav.favorites"         },
  { path: "/buyer/offers",             icon: BadgeDollarSign, labelKey: "nav.myOffers"          },
  { path: "/buyer/market-intelligence",icon: BarChart3,       labelKey: "nav.marketIntelligence"},
];

const sellerItems: NavItem[] = [
  { path: "/seller",           icon: LayoutDashboard, labelKey: "nav.home"      },
  { path: "/seller/listings",  icon: Building2,       labelKey: "nav.listings"  },
  { path: "/seller/offers",    icon: BadgeDollarSign, labelKey: "nav.offerInbox"},
  { path: "/seller/analytics", icon: BarChart3,       labelKey: "nav.analytics" },
  { path: "/seller/crm",       icon: Users,           labelKey: "nav.crmLeads"  },
];

const developerItems: NavItem[] = [
  { path: "/developer",               icon: LayoutDashboard, labelKey: "nav.home"              },
  { path: "/developer/opportunities", icon: Briefcase,       labelKey: "nav.opportunities"     },
  { path: "/developer/analyze",       icon: Search,          labelKey: "nav.analyzeLand"       },
  { path: "/developer/portfolio",     icon: TrendingUp,      labelKey: "nav.portfolioInsights" },
  { path: "/developer/market-intelligence", icon: BarChart3, labelKey: "nav.marketIntelligence"},
];

export default function MobileNav() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  let items = buyerItems;
  if (location.pathname.startsWith("/seller"))    items = sellerItems;
  if (location.pathname.startsWith("/developer")) items = developerItems;

  // In RTL, reverse the items so the "Home" item appears on the right
  const displayItems = isRTL ? [...items].reverse() : items;

  return (
    <nav className="mobile-bottom-nav lg:hidden" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/buyer" && item.path !== "/seller" && item.path !== "/developer" &&
              location.pathname.startsWith(item.path + "/"));
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[48px] max-w-[64px] flex-1 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-[22px] h-[22px] transition-transform ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -top-1 -end-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[9px] font-medium leading-none mt-0.5 text-center w-full truncate ${isActive ? "text-primary" : ""}`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
