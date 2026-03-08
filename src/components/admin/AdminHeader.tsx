import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdminHeader() {
  const { user, role, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/tenants?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="h-14 bg-[#1a1d27] border-b border-[#2a2d3a] flex items-center justify-between px-6 shrink-0">
      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants..." className="pl-8 h-8 w-64 bg-[#0f1117] border-[#2a2d3a] text-white text-sm" />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <span className="text-white">{user?.email}</span>
            {role && <StatusBadge status={role} className="ml-2" />}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-[#6b7280] hover:text-white">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
