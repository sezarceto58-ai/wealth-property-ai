import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useDashboardStats } from "@/hooks/admin/useDashboardStats";
import { useTenants } from "@/hooks/admin/useTenants";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Activity, AlertTriangle, FileDown, Bot, DollarSign, Package } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: tenantsData } = useTenants({ pageSize: 10 });
  const navigate = useNavigate();

  const planColors = { free: "#6b7280", pro: "#6366f1", elite: "#8b5cf6" };
  const pieData = stats ? [
    { name: "Free", value: stats.planCounts.free, fill: planColors.free },
    { name: "Pro", value: stats.planCounts.pro, fill: planColors.pro },
    { name: "Elite", value: stats.planCounts.elite, fill: planColors.elite },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[#2a2d3a]" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 bg-[#2a2d3a]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" subtitle="Platform overview and key metrics" />

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Total Tenants" value={stats?.totalTenants ?? 0} subtext={`${stats?.activeTenants ?? 0} active / ${stats?.suspendedTenants ?? 0} suspended`} icon={Users} color="indigo" />
        <AdminStatCard title="New Today" value={stats?.newToday ?? 0} icon={UserPlus} color="emerald" />
        <AdminStatCard title="Active Tenants" value={stats?.activeTenants ?? 0} icon={Activity} color="indigo" />
        <AdminStatCard title="Suspended" value={stats?.suspendedTenants ?? 0} icon={AlertTriangle} color="rose" />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Imports Today" value={stats?.importsToday ?? 0} subtext={`${stats?.failedImports ?? 0} failed`} icon={FileDown} color="amber" />
        <AdminStatCard title="AI Calls Today" value={stats?.aiCallsToday ?? 0} subtext={stats?.aiCallsToday ? `${((stats.failedAiToday / stats.aiCallsToday) * 100).toFixed(1)}% failure` : "0%"} icon={Bot} color="indigo" />
        <AdminStatCard title="AI Cost Today" value="$0.00" subtext="Est. based on token usage" icon={DollarSign} color="emerald" />
        <AdminStatCard title="Inventory Alerts" value={0} icon={Package} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Tenants by Plan</h3>
          {pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[#6b7280]">No tenants yet</div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-[#6b7280]">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Top Tenants</h3>
          <AdminTable
            columns={[
              { key: "name", label: "Tenant", render: (r: any) => <div className="flex items-center gap-2"><span className="text-white font-medium">{r.name}</span><span className="text-[#6b7280] text-xs">{r.city}</span></div> },
              { key: "plan", label: "Plan", render: (r: any) => <StatusBadge status={r.plan} /> },
              { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
              { key: "created_at", label: "Created", render: (r: any) => <span className="text-[#6b7280] text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
            ]}
            data={tenantsData?.data ?? []}
            onRowClick={(r) => navigate(`/admin/tenants/${r.id}`)}
            emptyMessage="No tenants yet"
          />
        </div>
      </div>
    </div>
  );
}
