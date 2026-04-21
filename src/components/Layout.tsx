import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, Users, MessageSquare, TrendingUp,
  Shield, Heart, Bell, Search, Menu, X, ChevronRight,
  BadgeDollarSign, GitCompareArrows, Plus, BarChart3, LogOut,
  Settings, CreditCard, Briefcase, User, LifeBuoy, Headphones,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationBell from "@/components/NotificationBell";
import PageTransition from "@/components/PageTransition";
import MobileNav from "@/components/MobileNav";
import InstallBanner from "@/components/InstallBanner";

// ─────────────────────────────────────────────────────────────
// Nav definitions — all shared pages use role-prefixed paths
// ─────────────────────────────────────────────────────────────

const buyerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/buyer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.marketplace"), items: [
    { path: "/buyer/discover",   icon: Search,           label: t("nav.discover") },
    { path: "/buyer/compare",    icon: GitCompareArrows, label: t("nav.compare") },
    { path: "/buyer/favorites",  icon: Heart,            label: t("nav.favorites") },
    { path: "/buyer/alerts",     icon: Bell,             label: t("nav.alerts") },
  ]},
  { label: t("nav.offersDeals"), items: [
    { path: "/buyer/offers",   icon: BadgeDollarSign, label: t("nav.myOffers") },
    { path: "/buyer/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.investorTools"), items: [
    { path: "/buyer/investor",            icon: TrendingUp, label: t("nav.aiIntelligence") },
    { path: "/buyer/market-intelligence", icon: BarChart3,  label: t("nav.marketIntelligence") },
    { path: "/buyer/syndication",         icon: Users,      label: t("nav.syndicationDeals") },
    { path: "/buyer/valuation",           icon: TrendingUp, label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

const sellerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/seller", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.listings"), items: [
    { path: "/seller/listings", icon: Building2, label: t("nav.myListings") },
    { path: "/seller/create",   icon: Plus,      label: t("nav.newListing") },
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
    { path: "/seller/market-intelligence", icon: BarChart3,  label: t("nav.marketIntelligence") },
    { path: "/seller/syndication",         icon: Users,      label: t("nav.syndicationDeals") },
    { path: "/seller/valuation",           icon: TrendingUp, label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

const developerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/developer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.opportunities"), items: [
    { path: "/developer/opportunities", icon: Briefcase,  label: t("nav.opportunityFeed") },
    { path: "/developer/portfolio",     icon: TrendingUp, label: t("nav.portfolioInsights") },
  ]},
  { label: t("nav.planning"), items: [
    { path: "/developer/analyze", icon: Search,    label: t("nav.analyzeLand") },
    { path: "/developer/plans",   icon: Building2, label: t("nav.allPlans") },
  ]},
  { label: t("nav.tools"), items: [
    { path: "/developer/messages",            icon: MessageSquare, label: t("common.messages") },
    { path: "/developer/market-intelligence", icon: BarChart3,     label: t("nav.marketIntelligence") },
    { path: "/developer/syndication",         icon: Users,         label: t("nav.syndicationDeals") },
    { path: "/developer/valuation",           icon: TrendingUp,    label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

const adminNav = (t: any) => [
  { label: t("nav.governance"), items: [
    { path: "/admin",               icon: Shield,     label: t("nav.console") },
    { path: "/admin/verifications", icon: Shield,     label: t("nav.sellerVerifications") },
    { path: "/admin/support",       icon: Headphones, label: t("admin.supportConsole") },
  ]},
];

// Shared paths that don't carry a role prefix
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

// ─────────────────────────────────────────────────────────────
// Layout component
// ─────────────────────────────────────────────────────────────

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  // Reactive RTL detection — re-renders when language changes
  const isRTL = i18n.dir() === "rtl";

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Remember last role-prefixed path so shared pages keep the correct nav
  const lastRoleRef = useRef<NavRole>("buyer");
  useEffect(() => {
    const detected = getRoleFromPath(location.pathname);
    if (detected) lastRoleRef.current = detected;
  }, [location.pathname]);

  const isShared   = SHARED_PATHS.some(p => location.pathname.startsWith(p));
  const activeRole = isShared
    ? lastRoleRef.current
    : (getRoleFromPath(location.pathname) ?? lastRoleRef.current);
  const nav = getNavForRole(activeRole, t);

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "TV";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Sidebar translate classes — must be reactive to RTL
  const sidebarHiddenClass = isRTL ? "translate-x-full" : "-translate-x-full";
  const sidebarSideClass   = isRTL ? "right-0 border-l border-sidebar-border" : "left-0 border-r border-sidebar-border";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar backdrop — full screen, high z-index, closes on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 z-50 w-72 bg-sidebar flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:z-auto
          ${sidebarSideClass}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : sidebarHiddenClass}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav */}
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && <ChevronRight className={`w-3 h-3 ms-auto shrink-0 opacity-60 ${isRTL ? "rotate-180" : ""}`} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom account links */}
        <div className="shrink-0 p-3 border-t border-sidebar-border space-y-0.5">
          <Link
            to="/pricing"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {t("common.pricing")}
          </Link>
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <User className="w-4 h-4" />
            {t("common.profile")}
          </Link>
          <Link
            to="/settings?tab=language"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LifeBuoy className="w-4 h-4" />
            {t("settings.language")}
          </Link>
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t("common.settings")}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("common.signOut")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur-md lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile so content isn't hidden behind MobileNav */}
        <div className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* ── Mobile bottom nav (shown on small screens only) ── */}
      <MobileNav />

      {/* ── PWA install banner ── */}
      <InstallBanner />
    </div>
  );
}
