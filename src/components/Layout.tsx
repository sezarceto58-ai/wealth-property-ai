import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const buyerNav = [
{
  label: "Home",
  items: [
  { path: "/buyer", icon: LayoutDashboard, label: "Dashboard" }]

},
{
  label: "Marketplace",
  items: [
  { path: "/buyer/discover", icon: Search, label: "Discover" },
  { path: "/buyer/compare", icon: GitCompareArrows, label: "Compare" },
  { path: "/buyer/favorites", icon: Heart, label: "Favorites" },
  { path: "/buyer/alerts", icon: Bell, label: "Alerts" }]

},
{
  label: "Offers & Deals",
  items: [
  { path: "/buyer/offers", icon: BadgeDollarSign, label: "My Offers" },
  { path: "/buyer/messages", icon: MessageSquare, label: "Messages" }]

},
{
  label: "Investor Tools",
  items: [
  { path: "/buyer/investor", icon: TrendingUp, label: "AI Intelligence" }]

}];


const sellerNav = [
{
  label: "Home",
  items: [
  { path: "/seller", icon: LayoutDashboard, label: "Dashboard" }]

},
{
  label: "Listings",
  items: [
  { path: "/seller/listings", icon: Building2, label: "My Listings" },
  { path: "/seller/create", icon: Plus, label: "New Listing" }]

},
{
  label: "Sales Pipeline",
  items: [
  { path: "/seller/offers", icon: BadgeDollarSign, label: "Offer Inbox" },
  { path: "/seller/crm", icon: Users, label: "CRM & Leads" },
  { path: "/seller/messages", icon: MessageSquare, label: "Messages" }]

},
{
  label: "Performance",
  items: [
  { path: "/seller/analytics", icon: BarChart3, label: "Analytics" }]

}];


const adminNav = [
{
  label: "Governance",
  items: [
  { path: "/admin", icon: Shield, label: "Console" }]

}];


function getNavForPath(pathname: string) {
  if (pathname.startsWith("/seller")) return sellerNav;
  if (pathname.startsWith("/admin")) return adminNav;
  return buyerNav;
}

export default function Layout({ children }: {children: React.ReactNode;}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const nav = getNavForPath(location.pathname);
  const initials = user?.user_metadata?.display_name ?
  user.user_metadata.display_name.slice(0, 2).toUpperCase() :
  user?.email?.slice(0, 2).toUpperCase() ?? "TV";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen &&
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={() => setSidebarOpen(false)} />

      }

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
        }>

        <div className="flex items-center justify-between p-5 border-b border-sidebar-border text-secondary">
          <Link to="/buyer" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-gradient-gold">TerraVista</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-200px)]">
          {nav.map((section) =>
          <div key={section.label}>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
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
                    isActive ?
                    "bg-primary/10 text-primary" :
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`
                    }>

                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>);

              })}
              </div>
            </div>
          )}
        </nav>

        {/* Account links */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border space-y-0.5">
          <Link
            to="/pricing"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Plans & Pricing
          </Link>
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
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
            <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>);

}