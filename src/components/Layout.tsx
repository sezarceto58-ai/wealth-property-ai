import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Heart,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  BadgeDollarSign,
  GitCompareArrows,
  Plus,
  BarChart3,
  LogOut,
  Settings,
  CreditCard,
  Briefcase,
  User,
  LifeBuoy,
  Headphones,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationBell from "@/components/NotificationBell";
import PageTransition from "@/components/PageTransition";

// ── Nav definitions ──
// All "shared" pages (Market Intelligence, Syndication, Support) use
// role-prefixed paths so routing and nav stay consistent.

const buyerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/buyer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.marketplace"), items: [
    { path: "/buyer/discover",   icon: Search,          label: t("nav.discover") },
    { path: "/buyer/compare",    icon: GitCompareArrows, label: t("nav.compare") },
    { path: "/buyer/favorites",  icon: Heart,            label: t("nav.favorites") },
    { path: "/buyer/alerts",     icon: Bell,             label: t("nav.alerts") },
  ]},
  { label: t("nav.offersDeals"), items: [
    { path: "/buyer/offers",   icon: BadgeDollarSign, label: t("nav.myOffers") },
    { path: "/buyer/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.investorTools"), items: [
    { path: "/buyer/investor",             icon: TrendingUp, label: t("nav.aiIntelligence") },
    { path: "/buyer/market-intelligence",  icon: BarChart3,  label: "Market Intelligence" },
    { path: "/buyer/syndication",          icon: Users,      label: "Syndication Deals" },
  ]},
  { label: "Help", items: [
    { path: "/support", icon: LifeBuoy, label: "Support Center" },
  ]},
];

const sellerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/seller", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.listings"), items: [
    { path: "/seller/listings",    icon: Building2, label: t("nav.myListings") },
    { path: "/seller/create",      icon: Plus,      label: t("nav.newListing") },
  ]},
  { label: t("nav.salesPipeline"), items: [
    { path: "/seller/offers",   icon: BadgeDollarSign, label: t("nav.offerInbox") },
    { path: "/seller/crm",      icon: Users,           label: t("nav.crmLeads") },
    { path: "/seller/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.performance"), items: [
    { path: "/seller/analytics",    icon: BarChart3, label: t("nav.analytics") },
    { path: "/seller/verification", icon: Shield,    label: t("nav.verification") },
  ]},
  { label: t("nav.aiTools"), items: [
    { path: "/seller/investor",            icon: TrendingUp, label: t("nav.investorIntelligence") },
    { path: "/seller/market-intelligence", icon: BarChart3,  label: "Market Intelligence" },
    { path: "/seller/syndication",         icon: Users,      label: "Syndication Deals" },
  ]},
  { label: "Help", items: [
    { path: "/support", icon: LifeBuoy, label: "Support Center" },
  ]},
];

const developerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/developer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.opportunities"), items: [
    { path: "/developer/opportunities", icon: Briefcase,   label: t("nav.opportunityFeed") },
    { path: "/developer/portfolio",     icon: TrendingUp,  label: t("nav.portfolioInsights") },
  ]},
  { label: t("nav.planning"), items: [
    { path: "/developer/analyze", icon: Search,    label: t("nav.analyzeLand") },
    { path: "/developer/plans",   icon: Building2, label: t("nav.allPlans") },
  ]},
  { label: t("nav.tools"), items: [
    { path: "/developer/messages",            icon: MessageSquare, label: t("common.messages") },
    { path: "/developer/market-intelligence", icon: BarChart3,     label: "Market Intelligence" },
    { path: "/developer/syndication",         icon: Users,         label: "Syndication Deals" },
  ]},
  { label: "Help", items: [
    { path: "/support", icon: LifeBuoy, label: "Support Center" },
  ]},
];

const adminNav = (t: any) => [
  { label: t("nav.governance"), items: [
    { path: "/admin",               icon: Shield,     label: t("nav.console") },
    { path: "/admin/verifications", icon: Shield,     label: t("nav.sellerVerifications") },
    { path: "/admin/support",       icon: Headphones, label: "Support Console" },
  ]},
];

// ── Shared paths that don't carry a role prefix ──
const SHARED_PATHS = ["/support", "/pricing", "/profile", "/settings"];

type NavRole = "buyer" | "seller" | "developer" | "admin";

function getNavForRole(role: NavRole, t: any) {
  if (role === "developer") return developerNav(t);
  if (role === "seller")    return sellerNav(t);
  if (role === "admin")     return adminNav(t);
  return buyerNav(t);
}

function getRoleFromPath(pathname: string): NavRole | null {
  if (pathname.startsWith("/developer")) return "developer";
  if (pathname.startsWith("/seller"))    return "seller";
  if (pathname.startsWith("/admin"))     return "admin";
  if (pathname.startsWith("/buyer"))     return "buyer";
  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  // ── Remember the last role-prefixed path so shared pages keep the correct nav ──
  const lastRoleRef = useRef<NavRole>("buyer");

  useEffect(() => {
    const detected = getRoleFromPath(location.pathname);
    if (detected) lastRoleRef.current = detected;
  }, [location.pathname]);

  const isShared = SHARED_PATHS.some(p => location.pathname.startsWith(p));
  const activeRole = isShared ? lastRoleRef.current : (getRoleFromPath(location.pathname) ?? lastRoleRef.current);
  const nav = getNavForRole(activeRole, t);

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "TV";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border shrink-0">
          <Link to="/buyer" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient-gold">TerraVista</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav — flex-1 so it fills available space between logo and bottom links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 pb-2">
          {nav.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom account links — no longer absolute, stays in normal flow */}
        <div className="shrink-0 p-3 border-t border-sidebar-border space-y-0.5">
          <Link
            to="/pricing"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {t("common.pricing")}
          </Link>
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t("common.settings")}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("common.signOut")}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
