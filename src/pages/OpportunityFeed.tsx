import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus, Search, TrendingUp, MapPin, DollarSign, Building2, Filter,
  ArrowUpDown, Briefcase, AlertTriangle, ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  investment_type: string;
  property_type: string;
  city: string | null;
  address: string | null;
  entry_price: number;
  currency: string;
  estimated_dev_cost: number;
  expected_revenue: number;
  land_area: number;
  status: string;
  risk_level: string;
  investment_score: number;
  tags: string[];
  timeline_months: number;
  created_at: string;
};

const typeColors: Record<string, string> = {
  buy: "bg-primary/10 text-primary",
  develop: "bg-warning/10 text-warning",
  flip: "bg-success/10 text-success",
  rent: "bg-info/10 text-info",
};

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export default function OpportunityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    if (!user) return;
    fetchOpportunities();
  }, [user]);

  const fetchOpportunities = async () => {
    const { data, error } = await (supabase
      .from("opportunities" as any)
      .select("*")
      .order("created_at", { ascending: false }) as any);
    if (error) {
      toast.error("Failed to load opportunities");
    } else {
      setOpportunities(data || []);
    }
    setLoading(false);
  };

  const filtered = opportunities
    .filter((o) => {
      if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.city?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && o.investment_type !== typeFilter) return false;
      if (riskFilter !== "all" && o.risk_level !== riskFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "investment_score") return b.investment_score - a.investment_score;
      if (sortBy === "entry_price") return a.entry_price - b.entry_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalValue = opportunities.reduce((s, o) => s + o.entry_price, 0);
  const avgScore = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.investment_score, 0) / opportunities.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Opportunity Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-ranked investment opportunities</p>
        </div>
        <Button onClick={() => navigate("/developer/opportunities/create")} className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> New Opportunity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Opportunities", value: opportunities.length, icon: Briefcase, color: "text-primary" },
          { label: "Portfolio Value", value: `$${(totalValue / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-success" },
          { label: "Avg Investment Score", value: avgScore, icon: TrendingUp, color: "text-warning" },
          { label: "Active", value: opportunities.filter((o) => o.status === "active").length, icon: Sparkles, color: "text-info" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="develop">Develop</SelectItem>
            <SelectItem value="flip">Flip</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px]"><AlertTriangle className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest First</SelectItem>
            <SelectItem value="investment_score">Highest Score</SelectItem>
            <SelectItem value="entry_price">Lowest Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-10 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No opportunities yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first investment opportunity to start tracking.</p>
          <Button onClick={() => navigate("/developer/opportunities/create")} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" /> Create Opportunity
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => (
            <Link key={opp.id} to={`/developer/opportunities/${opp.id}`}
              className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground truncate">{opp.title}</p>
                  <Badge variant="outline" className={`text-[10px] ${typeColors[opp.investment_type]}`}>
                    {opp.investment_type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {opp.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.city}</span>}
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${opp.entry_price.toLocaleString()}</span>
                  <span className={riskColors[opp.risk_level]}>{opp.risk_level} risk</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <span className={`text-sm font-bold ${opp.investment_score >= 70 ? "text-success" : opp.investment_score >= 40 ? "text-warning" : "text-destructive"}`}>
                    {opp.investment_score}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{new Date(opp.created_at).toLocaleDateString()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
