import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { useTenants, useSuspendTenant, useUpdateTenantPlan } from "@/hooks/admin/useTenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/audit-logger";

export default function AdminTenantsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useTenants({ search, plan, status, page });
  const suspendMutation = useSuspendTenant();
  const planMutation = useUpdateTenantPlan();

  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; description: string; action: (reason: string) => void; destructive: boolean }>({ open: false, title: "", description: "", action: () => {}, destructive: false });

  const handleExport = async () => {
    await logAdminAction({ action: "audit_log_exported", targetType: "tenants_csv", reason: "Export tenant list" });
    const csv = ["Name,City,Plan,Status,Created"].concat(
      (data?.data ?? []).map((t: any) => `${t.name},${t.city},${t.plan},${t.status},${t.created_at}`)
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tenants.csv"; a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="All Tenants" subtitle={`${data?.total ?? 0} tenants total`} actions={
        <Button onClick={handleExport} className="bg-[#6366f1] hover:bg-[#4f46e5]"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      } />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tenants..." className="w-64 bg-[#1a1d27] border-[#2a2d3a] text-white" />
        <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(1); }}>
          <SelectTrigger className="w-36 bg-[#1a1d27] border-[#2a2d3a] text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#1a1d27] border-[#2a2d3a]">
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 bg-[#1a1d27] border-[#2a2d3a] text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#1a1d27] border-[#2a2d3a]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        columns={[
          { key: "name", label: "Tenant", render: (r: any) => <div><div className="text-white font-medium">{r.name}</div><div className="text-[#6b7280] text-xs">{r.city ?? "—"}</div></div> },
          { key: "plan", label: "Plan", render: (r: any) => <StatusBadge status={r.plan} /> },
          { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { key: "created_at", label: "Created", render: (r: any) => <span className="text-[#6b7280] text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
          { key: "actions", label: "Actions", render: (r: any) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-[#6366f1] text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/admin/tenants/${r.id}`); }}>View</Button>
              {r.status === "active" ? (
                <Button variant="ghost" size="sm" className="text-[#ef4444] text-xs" onClick={(e) => { e.stopPropagation(); setConfirmModal({ open: true, title: "Suspend Tenant", description: `Suspend "${r.name}"?`, destructive: true, action: (reason) => suspendMutation.mutate({ tenantId: r.id, suspend: true, reason }, { onSuccess: () => toast.success("Tenant suspended") }) }); }}>Suspend</Button>
              ) : r.status === "suspended" ? (
                <Button variant="ghost" size="sm" className="text-[#10b981] text-xs" onClick={(e) => { e.stopPropagation(); setConfirmModal({ open: true, title: "Resume Tenant", description: `Resume "${r.name}"?`, destructive: false, action: (reason) => suspendMutation.mutate({ tenantId: r.id, suspend: false, reason }, { onSuccess: () => toast.success("Tenant resumed") }) }); }}>Resume</Button>
              ) : null}
            </div>
          )},
        ]}
        data={data?.data ?? []}
        loading={isLoading}
        onRowClick={(r) => navigate(`/admin/tenants/${r.id}`)}
        emptyMessage="No tenants found"
      />

      {/* Pagination */}
      {(data?.total ?? 0) > 25 && (
        <div className="flex items-center justify-between text-sm text-[#6b7280]">
          <span>Page {page} of {Math.ceil((data?.total ?? 0) / 25)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-[#2a2d3a] text-white">Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 25 >= (data?.total ?? 0)} onClick={() => setPage(page + 1)} className="border-[#2a2d3a] text-white">Next</Button>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal} onOpenChange={(open) => setConfirmModal(p => ({ ...p, open }))} onConfirm={confirmModal.action} />
    </div>
  );
}
