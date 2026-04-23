/**
 * Investor Syndication — simplified deal feed with fixed button colors
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, TrendingUp, Clock, BadgeCheck, MapPin, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import StatsCard from "@/components/StatsCard";
import InvestmentScore, { calculateDealScore } from "@/components/InvestmentScore";

export interface SyndicationDeal {
  id: string; title: string; description: string;
  city: string; district: string; propertyType: string; image: string;
  developer: string; developerRating: number;
  askingPrice: number; targetRaise: number; raisedAmount: number;
  minInvestment: number; maxInvestment: number;
  projectedROI: number; projectedIRR: number; rentalYield: number;
  holdingPeriod: number; status: "open" | "closing_soon" | "funded" | "active" | "exited";
  closeDate: string; investorCount: number; maxInvestors: number;
  aiValuation: number; verified: boolean; highlights: string[];
  riskLevel: "low" | "medium" | "high";
}

export const syndicationDeals: SyndicationDeal[] = [
  {
    id: "syn-001", title: "Ankawa Premium Residence Tower",
    description: "Class-A residential tower with 48 luxury apartments. Hotel-managed rentals. Verified title.",
    city: "Erbil", district: "Ankawa", propertyType: "Apartment",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    developer: "KRG Properties", developerRating: 4.6,
    askingPrice: 4800000, targetRaise: 3200000, raisedAmount: 2560000,
    minInvestment: 25000, maxInvestment: 500000,
    projectedROI: 14.2, projectedIRR: 11.8, rentalYield: 8.5,
    holdingPeriod: 5, status: "closing_soon", closeDate: "2026-04-01",
    investorCount: 31, maxInvestors: 40, aiValuation: 5100000, verified: true,
    highlights: ["Hotel-managed income", "5-star amenities", "Quarterly distributions"],
    riskLevel: "low",
  },
  {
    id: "syn-002", title: "Mansour Commercial Hub",
    description: "Mixed-use commercial complex in Mansour district. Anchor tenant pre-signed on 5-year lease.",
    city: "Baghdad", district: "Mansour", propertyType: "Commercial",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    developer: "Baghdad Invest Group", developerRating: 4.1,
    askingPrice: 7200000, targetRaise: 5000000, raisedAmount: 1800000,
    minInvestment: 50000, maxInvestment: 1000000,
    projectedROI: 11.6, projectedIRR: 9.3, rentalYield: 9.2,
    holdingPeriod: 7, status: "open", closeDate: "2026-05-15",
    investorCount: 18, maxInvestors: 60, aiValuation: 7650000, verified: true,
    highlights: ["Anchor tenant signed", "9.2% yield from Day 1", "Tax incentive zone"],
    riskLevel: "medium",
  },
  {
    id: "syn-003", title: "Bakhtiari Villa Collection",
    description: "12 luxury villas in Sulaymaniyah's premier neighborhood. 80% pre-sold.",
    city: "Sulaymaniyah", district: "Bakhtiari", propertyType: "Villa",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    developer: "Sul Premium Homes", developerRating: 4.4,
    askingPrice: 2800000, targetRaise: 1800000, raisedAmount: 1800000,
    minInvestment: 15000, maxInvestment: 300000,
    projectedROI: 18.5, projectedIRR: 14.2, rentalYield: 7.5,
    holdingPeriod: 3, status: "funded", closeDate: "2026-02-01",
    investorCount: 22, maxInvestors: 22, aiValuation: 3050000, verified: true,
    highlights: ["Fully funded", "Construction underway", "3-year exit"],
    riskLevel: "low",
  },
  {
    id: "syn-004", title: "Ashar Waterfront Residences",
    description: "First waterfront residential development in Basra. Government-backed infrastructure.",
    city: "Basra", district: "Ashar", propertyType: "Apartment",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    developer: "Basra Dev Corp", developerRating: 3.8,
    askingPrice: 3500000, targetRaise: 2000000, raisedAmount: 620000,
    minInvestment: 20000, maxInvestment: 400000,
    projectedROI: 13.1, projectedIRR: 10.5, rentalYield: 10.1,
    holdingPeriod: 5, status: "open", closeDate: "2026-06-30",
    investorCount: 11, maxInvestors: 50, aiValuation: 3750000, verified: false,
    highlights: ["Waterfront location", "10.1% yield potential", "Government-backed"],
    riskLevel: "high",
  },
];

function daysLeft(dateStr: string) {
  return Math.max(0, Math.round((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

const STATUS_LABEL: Record<string, { text: string; style: string }> = {
  open:          { text: "Open",         style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  closing_soon:  { text: "Closing Soon", style: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  funded:        { text: "Fully Funded", style: "bg-primary/10 text-primary" },
  active:        { text: "Active",       style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  exited:        { text: "Exited",       style: "bg-secondary text-secondary-foreground" },
};
const RISK_STYLE: Record<string, string> = {
  low:    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  high:   "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

function DealCard({ deal }: { deal: SyndicationDeal }) {
  const navigate = useNavigate();
  const fillPct = Math.round((deal.raisedAmount / deal.targetRaise) * 100);
  const days = daysLeft(deal.closeDate);
  const st = STATUS_LABEL[deal.status];

  return (
    <div
      onClick={() => navigate(`/buyer/syndication/${deal.id}`)}
      className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${st.style}`}>{st.text}</span>
          {deal.verified && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-primary/90 text-white flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${RISK_STYLE[deal.riskLevel]}`}>
            {deal.riskLevel.toUpperCase()} RISK
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-sm leading-snug">{deal.title}</p>
          <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {deal.district}, {deal.city}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Funding bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              Raised <span className="font-semibold text-foreground">${(deal.raisedAmount / 1e6).toFixed(1)}M</span>
              {" "}of{" "}
              <span className="font-semibold text-foreground">${(deal.targetRaise / 1e6).toFixed(1)}M</span>
            </span>
            <span className="font-bold text-primary">{fillPct}%</span>
          </div>
          <Progress value={fillPct} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{deal.investorCount}/{deal.maxInvestors} investors</span>
            {deal.status !== "funded" && days > 0 && (
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {days}d left</span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Proj. ROI</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{deal.projectedROI}%</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">IRR</p>
            <p className="text-sm font-bold text-primary">{deal.projectedIRR}%</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Hold</p>
            <p className="text-sm font-bold text-foreground">{deal.holdingPeriod}yr</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Min: <span className="font-semibold text-foreground">${deal.minInvestment.toLocaleString()}</span>
          </div>
          <InvestmentScore
            input={{
              price: deal.askingPrice, aiValuation: deal.aiValuation,
              rentalYield: deal.rentalYield, city: deal.city, district: deal.district,
              propertyType: deal.propertyType, developerRating: deal.developerRating,
              verified: deal.verified,
            }}
            compact
          />
        </div>

        <div className="flex items-center justify-end text-xs font-semibold text-primary">
          View Deal <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </div>
  );
}

type StatusFilter = "all" | "open" | "closing_soon" | "funded";
type RiskFilter   = "all" | "low" | "medium" | "high";

export default function SyndicationDeals() {
  const { t } = useTranslation();
  const [statusF, setStatusF] = useState<StatusFilter>("all");
  const [riskF, setRiskF]     = useState<RiskFilter>("all");

  const filtered = syndicationDeals.filter(
    (d) => (statusF === "all" || d.status === statusF) && (riskF === "all" || d.riskLevel === riskF)
  );

  const totalRaised = syndicationDeals.reduce((s, d) => s + d.raisedAmount, 0);
  const totalTarget = syndicationDeals.reduce((s, d) => s + d.targetRaise, 0);
  const open = syndicationDeals.filter((d) => d.status === "open" || d.status === "closing_soon").length;

  const pillBase = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all";
  const pillActive = "bg-primary text-white";
  const pillInactive = "text-secondary-foreground hover:bg-secondary/70";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Investor Syndication
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Co-invest in institutional-quality real estate deals with vetted developers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Raised"   value={`$${(totalRaised / 1e6).toFixed(1)}M`} change={`of $${(totalTarget / 1e6).toFixed(0)}M`} icon={DollarSign} trend="up" />
        <StatsCard title="Open Deals"     value={open}   icon={TrendingUp} />
        <StatsCard title="Avg Proj. ROI"  value="14.4%"  change="+2.1% vs market" icon={TrendingUp} trend="up" />
        <StatsCard title="Active Investors" value={syndicationDeals.reduce((s, d) => s + d.investorCount, 0)} icon={Users} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {(["all", "open", "closing_soon", "funded"] as const).map((f) => (
            <button key={f} onClick={() => setStatusF(f)} className={`${pillBase} ${statusF === f ? pillActive : pillInactive}`}>
              {f === "all" ? "All" : f === "closing_soon" ? "Closing Soon" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {(["all", "low", "medium", "high"] as const).map((r) => (
            <button key={r} onClick={() => setRiskF(r)} className={`${pillBase} ${riskF === r ? pillActive : pillInactive}`}>
              {r === "all" ? "All Risk" : `${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">No deals match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Are you a developer with a deal?</p>
          <p className="text-sm text-muted-foreground mt-0.5">Reach 500+ verified investors on AqarAI Syndication.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0">
          Submit a Deal
        </button>
      </div>
    </div>
  );
}
