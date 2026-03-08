import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout({ children }: PropsWithChildren) {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0f1117] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#6366f1] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="px-6 py-3 border-t border-[#2a2d3a] text-xs text-[#6b7280]">
          SmartMenu Admin v1.0
        </footer>
      </div>
    </div>
  );
}
