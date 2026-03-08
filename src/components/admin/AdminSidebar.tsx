import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdminAuth, canAccess } from "@/hooks/admin/useAdminAuth";
import {
  LayoutDashboard, Activity, Users, FileDown, CreditCard, Flag, Bot,
  ScrollText, Bell, Heart, Settings, LogOut, ChevronLeft, ChevronRight, Menu,
} from "lucide-react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
      { path: "/admin/system-health", icon: Activity, label: "System Health" },
    ],
  },
  {
    label: "TENANT MANAGEMENT",
    items: [
      { path: "/admin/tenants", icon: Users, label: "All Tenants" },
      { path: "/admin/import-monitor", icon: FileDown, label: "Import Monitor" },
    ],
  },
  {
    label: "CONFIGURATION",
    items: [
      { path: "/admin/plans", icon: CreditCard, label: "Plans & Limits" },
      { path: "/admin/feature-flags", icon: Flag, label: "Feature Flags" },
      { path: "/admin/ai-control", icon: Bot, label: "AI Control" },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { path: "/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
      { path: "/admin/notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    label: "SETTINGS",
    ownerOnly: true,
    items: [
      { path: "/admin/billing", icon: Heart, label: "Billing" },
    ],
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAdminAuth();
  const location = useLocation();

  return (
    <aside className={cn("h-screen sticky top-0 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col transition-all duration-200", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="p-4 border-b border-[#2a2d3a] flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#6366f1] flex items-center justify-center text-white font-bold text-sm shrink-0">SM</div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">SmartMenu</div>
            <div className="text-[#6b7280] text-xs">Admin Console</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {navSections.map((section) => {
          if (section.ownerOnly && role !== "owner") return null;
          return (
            <div key={section.label}>
              {!collapsed && <div className="px-4 text-[10px] font-semibold text-[#6b7280] tracking-wider mb-2">{section.label}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm transition-colors",
                    isActive ? "bg-[#6366f1]/20 text-[#6366f1]" : "text-[#6b7280] hover:text-white hover:bg-[#2a2d3a]",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="p-3 border-t border-[#2a2d3a] text-[#6b7280] hover:text-white flex items-center justify-center">
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
