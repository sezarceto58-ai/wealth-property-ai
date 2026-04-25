import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, Users, MessageSquare, TrendingUp,
  Shield, Heart, Bell, Search, X, ChevronRight,
  BadgeDollarSign, GitCompareArrows, Plus, BarChart3, LogOut,
  Settings, CreditCard, Briefcase, User, LifeBuoy, Sparkles,
  Menu, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationBell from "@/components/NotificationBell";
import PageTransition from "@/components/PageTransition";
import MobileNav from "@/components/MobileNav";
import InstallBanner from "@/components/InstallBanner";

type NavRole = "buyer" | "seller" | "developer" | "admin";
const SHARED_PATHS = ["/settings", "/profile", "/support", "/pricing", "/property"];

function getRoleFromPath(pathname: string): NavRole | null {
  if (pathname.startsWith("/buyer"))     return "buyer";
  if (pathname.startsWith("/seller"))    return "seller";
  if (pathname.startsWith("/developer")) return "developer";
  if (pathname.startsWith("/admin"))     return "admin";
  return null;
}

const buyerNav = (t: any) => [
  { label: t("nav.home"), items: [
    { path: "/buyer", icon: LayoutDashboard, label: t("nav.dashboard") },
  ]},
  { label: t("nav.marketplace"), items: [
    { path: "/buyer/discover",            icon: Search,           label: t("nav.discover") },
    { path: "/buyer/compare",             icon: GitCompareArrows, label: t("nav.compare") },
    { path: "/buyer/favorites",           icon: Heart,            label: t("nav.favorites") },
    { path: "/buyer/alerts",              icon: Bell,             label: t("nav.alerts") },
  ]},
  { label: t("nav.offersDeals"), items: [
    { path: "/buyer/offers",   icon: BadgeDollarSign, label: t("nav.myOffers") },
    { path: "/buyer/messages", icon: MessageSquare,   label: t("common.messages") },
  ]},
  { label: t("nav.investorTools"), items: [
    { path: "/buyer/investor",            icon: TrendingUp, label: t("nav.aiIntelligence") },
    { path: "/buyer/market-intelligence", icon: BarChart3,  label: t("nav.marketIntelligence") },
    { path: "/buyer/valuation",           icon: Sparkles,   label: t("nav.aiValuation") },
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
    { path: "/seller/valuation",           icon: Sparkles,   label: t("nav.aiValuation") },
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
    { path: "/developer/valuation",           icon: Sparkles,      label: t("nav.aiValuation") },
  ]},
  { label: t("nav.support"), items: [
    { path: "/support", icon: LifeBuoy, label: t("support.title") },
  ]},
];

const adminNav = (t: any) => [
  { label: t("nav.governance"), items: [
    { path: "/admin",               icon: Shield,     label: t("nav.console") },
    { path: "/admin/verifications", icon: Shield,     label: t("nav.sellerVerifications") },
    { path: "/admin/support",       icon: Headphones, label: t("nav.supportTickets") },
  ]},
];

function Headphones(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function getNavForRole(role: NavRole, t: any) {
  switch (role) {
    case "buyer":     return buyerNav(t);
    case "seller":    return sellerNav(t);
    case "developer": return developerNav(t);
    case "admin":     return adminNav(t);
  }
}

// ── Accordion Nav Group ────────────────────────────────────────
function NavGroup({
  section,
  isOpen,
  onToggle,
  pathname,
  onNav,
  isRTL,
}: {
  section: { label: string; items: { path: string; icon: any; label: string }[] };
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onNav: () => void;
  isRTL: boolean;
}) {
  const hasActive = section.items.some(item => pathname === item.path);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="overflow-hidden">
      {/* Group header button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
          hasActive
            ? "text-primary bg-primary/15"
            : "opacity-50 hover:opacity-80 hover:bg-white/5"
        }`}
        style={{ color: hasActive ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))" }}
        aria-expanded={isOpen}
      >
        {/* Active indicator bar */}
        <span
          className={`w-1 h-4 rounded-full transition-all duration-300 shrink-0 ${
            hasActive ? "bg-primary" : "bg-white/15"
          }`}
        />
        <span className="flex-1 text-start">{section.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${isRTL ? "me-auto ms-0" : ""}`}
        />
      </button>

      {/* Animated items panel */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${(contentRef.current?.scrollHeight ?? 400)}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pt-0.5 pb-1 ps-2 space-y-0.5">
          {section.items.map((navItem) => {
            const isActive = pathname === navItem.path;
            return (
              <Link
                key={navItem.path}
                to={navItem.path}
                onClick={onNav}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? "text-white"
                    : "hover:bg-white/8"
                }`}
                style={{
                  color: isActive ? "#fff" : "hsl(var(--sidebar-foreground) / 0.75)",
                  background: isActive
                    ? "linear-gradient(135deg, hsl(var(--sidebar-primary) / 0.35), hsl(var(--sidebar-primary) / 0.20))"
                    : undefined,
                  boxShadow: isActive ? "inset 0 0 0 1px hsl(var(--sidebar-primary) / 0.25)" : undefined,
                }}
              >
                {/* Active left accent */}
                {isActive && (
                  <span
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                  />
                )}
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive ? "bg-primary/30" : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <navItem.icon className={`w-3.5 h-3.5 ${isActive ? "text-primary-foreground" : ""}`} />
                </div>
                <span className="truncate flex-1 text-sm">{navItem.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Layout ────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup]     = useState<string | null>(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const lastRoleRef = useRef<NavRole>("buyer");
  useEffect(() => {
    const detected = getRoleFromPath(location.pathname);
    if (detected) lastRoleRef.current = detected;
  }, [location.pathname]);

  const isShared   = SHARED_PATHS.some(p => location.pathname.startsWith(p));
  const activeRole = isShared ? lastRoleRef.current : (getRoleFromPath(location.pathname) ?? lastRoleRef.current);
  const nav = getNavForRole(activeRole, t);

  // Auto-open the group that contains the current route
  useEffect(() => {
    const activeSection = nav.find(section =>
      section.items.some(item => location.pathname === item.path)
    );
    if (activeSection) setOpenGroup(activeSection.label);
  }, [location.pathname, activeRole]);

  const handleGroupToggle = useCallback((label: string) => {
    setOpenGroup(prev => prev === label ? null : label);
  }, []);

  const displayName = user?.user_metadata?.display_name ?? user?.email ?? "";
  const initials    = displayName.slice(0, 2).toUpperCase() || "A";
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const sidebarHiddenClass = isRTL ? "translate-x-full" : "-translate-x-full";
  const sidebarSideClass   = isRTL ? "right-0" : "left-0";

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 flex flex-col transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:w-64 lg:z-auto lg:bottom-auto lg:top-auto
          ${sidebarSideClass}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : sidebarHiddenClass}
          sidebar-dark
        `}
        style={{
          borderRight: isRTL ? "none" : "1px solid hsl(var(--sidebar-border))",
          borderLeft:  isRTL ? "1px solid hsl(var(--sidebar-border))" : "none",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold shrink-0">
              <Building2 style={{ width: "1.1rem", height: "1.1rem" }} className="text-white" />
            </div>
            <div>
              <span className="text-base font-display font-bold text-gradient-gold block leading-tight">AqarAI</span>
              <span className="text-[10px] leading-none block mt-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
                {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Accordion Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 pb-4" style={{ minHeight: 0 }}>
          {nav.map((section) => (
            <NavGroup
              key={section.label}
              section={section}
              isOpen={openGroup === section.label}
              onToggle={() => handleGroupToggle(section.label)}
              pathname={location.pathname}
              onNav={() => setSidebarOpen(false)}
              isRTL={isRTL}
            />
          ))}
        </nav>

        {/* Bottom account section */}
        <div className="shrink-0 p-3 border-t space-y-0.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          {[
            { to: "/pricing", icon: CreditCard, label: t("common.pricing") },
            { to: "/profile",  icon: User,       label: t("common.profile") },
            { to: "/settings", icon: Settings,   label: t("common.settings") },
          ].map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-white/10 text-white" : "hover:bg-white/8 opacity-70 hover:opacity-100"
                }`}
                style={{ color: "hsl(var(--sidebar-foreground))" }}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/15 opacity-60 hover:opacity-100"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
          >
            <LogOut className="w-4 h-4" />
            {t("common.signOut")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-background/85 backdrop-blur-xl shrink-0 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-display font-bold text-gradient-gold">AqarAI</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageToggle />
            <NotificationBell />
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-primary hover:scale-105 transition-transform"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 pb-nav lg:pb-6 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <MobileNav />
      <InstallBanner />
    </div>
  );
}
