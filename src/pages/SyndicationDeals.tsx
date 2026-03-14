/**
 * Investor Syndication Module — Module 4
 * Deal pages with investment slots, target raise, and investor tracking.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, DollarSign, TrendingUp, Clock, BadgeCheck, Target,
  ChevronRight, Shield, Building2, MapPin, Zap, Lock } from
"lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatsCard from "@/components/StatsCard";
import InvestmentScore, { calculateDealScore } from "@/components/InvestmentScore";

// ── Types ──
export interface SyndicationDeal {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  propertyType: string;
  image: string;
  developer: string;
  developerRating: number;
  askingPrice: number;
  targetRaise: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  projectedROI: number;
  projectedIRR: number;
  rentalYield: number;
  holdingPeriod: number; // years
  status: "open" | "closing_soon" | "funded" | "active" | "exited";
  closeDate: string;
  investorCount: number;
  maxInvestors: number;
  aiValuation: number;
  verified: boolean;
  highlights: string[];
  riskLevel: "low" | "medium" | "high";
}

// ── Mock Data ──
export const syndicationDeals: SyndicationDeal[] = [
{
  id: "syn-001",
  title: "Ankawa Premium Residence Tower",
  description: "A Class-A residential tower in Ankawa's most sought-after corridor. 48 luxury apartments with hotel-managed rentals. Full legal structure, verified title.",
  city: "Erbil", district: "Ankawa",
  propertyType: "Apartment",
  image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  developer: "KRG Properties", developerRating: 4.6,
  askingPrice: 4800000, targetRaise: 3200000, raisedAmount: 2560000,
  minInvestment: 25000, maxInvestment: 500000,
  projectedROI: 14.2, projectedIRR: 11.8, rentalYield: 8.5,
  holdingPeriod: 5, status: "closing_soon",
  closeDate: "2026-04-01",
  investorCount: 31, maxInvestors: 40,
  aiValuation: 5100000, verified: true,
  highlights: ["Hotel-managed rental income", "5-star lobby & amenities", "Exit via IPO or trade sale", "Quarterly distributions"],
  riskLevel: "low"
},
{
  id: "syn-002",
  title: "Mansour Commercial Hub",
  description: "Mixed-use commercial complex in the heart of Mansour district. Ground-floor retail + office floors above. Anchor tenant pre-signed.",
  city: "Baghdad", district: "Mansour",
  propertyType: "Commercial",
  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  developer: "Baghdad Invest Group", developerRating: 4.1,
  askingPrice: 7200000, targetRaise: 5000000, raisedAmount: 1800000,
  minInvestment: 50000, maxInvestment: 1000000,
  projectedROI: 11.6, projectedIRR: 9.3, rentalYield: 9.2,
  holdingPeriod: 7, status: "open",
  closeDate: "2026-05-15",
  investorCount: 18, maxInvestors: 60,
  aiValuation: 7650000, verified: true,
  highlights: ["Anchor tenant signed (5yr lease)", "9.2% rental yield from Day 1", "Below AI valuation by 6%", "Tax incentive zone"],
  riskLevel: "medium"
},
{
  id: "syn-003",
  title: "Bakhtiari Villa Collection",
  description: "Boutique development of 12 luxury villas in Sulaymaniyah's most prestigious enclave. Pre-sold units provide de-risked returns.",
  city: "Sulaymaniyah", district: "Bakhtiari",
  propertyType: "Villa",
  image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  developer: "Sul Premium Homes", developerRating: 4.4,
  askingPrice: 2800000, targetRaise: 1800000, raisedAmount: 1800000,
  minInvestment: 15000, maxInvestment: 300000,
  projectedROI: 18.5, projectedIRR: 14.2, rentalYield: 7.5,
  holdingPeriod: 3, status: "funded",
  closeDate: "2026-02-01",
  investorCount: 22, maxInvestors: 22,
  aiValuation: 3050000, verified: true,
  highlights: ["Fully funded", "12 villas 80% pre-sold", "Construction underway", "3-year exit"],
  riskLevel: "low"
},
{
  id: "syn-004",
  title: "Ashar Waterfront Residences",
  description: "First-of-its-kind waterfront residential development in Basra. Strong government backing and infrastructure support.",
  city: "Basra", district: "Ashar",
  propertyType: "Apartment",
  image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  developer: "Basra Dev Corp", developerRating: 3.8,
  askingPrice: 3500000, targetRaise: 2000000, raisedAmount: 620000,
  minInvestment: 20000, maxInvestment: 400000,
  projectedROI: 13.1, projectedIRR: 10.5, rentalYield: 10.1,
  holdingPeriod: 5, status: "open",
  closeDate: "2026-06-30",
  investorCount: 11, maxInvestors: 50,
  aiValuation: 3750000, verified: false,
  highlights: ["Waterfront premium location", "10.1% yield potential", "Government-backed", "High capital growth upside"],
  riskLevel: "high"
}];


// ── Helper: days remaining ──
function daysRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 86400000));
}

// ── Deal Card ──
function DealCard({ deal }: {deal: SyndicationDeal;}) {
  const navigate = useNavigate();
  const fillPct = Math.round(deal.raisedAmount / deal.targetRaise * 100);
  const days = daysRemaining(deal.closeDate);

  const statusConfig = {
    open: { label: "Open", color: "bg-success/10 text-success border-success/20" },
    closing_soon: { label: "Closing Soon", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    funded: { label: "Fully Funded", color: "bg-primary/10 text-primary border-primary/20" },
    active: { label: "Active", color: "bg-success/10 text-success border-success/20" },
    exited: { label: "Exited", color: "bg-secondary text-muted-foreground border-border" }
  };
  const sc = statusConfig[deal.status];

  const investmentScore = calculateDealScore({
    price: deal.askingPrice,
    aiValuation: deal.aiValuation,
    rentalYield: deal.rentalYield,
    city: deal.city,
    district: deal.district,
    propertyType: deal.propertyType,
    developerRating: deal.developerRating,
    verified: deal.verified
  });

  return (
    <div
      onClick={() => navigate(`/buyer/syndication/${deal.id}`)}
      className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer group">
      
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${sc.color}`}>
            {sc.label}
          </span>
          {deal.verified &&
          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-primary/80 text-primary-foreground backdrop-blur-sm flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          }
        </div>
        <div className="absolute bottom-3 right-3">
          <div className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
          deal.riskLevel === "low" ? "bg-success/80 text-success-foreground" :
          deal.riskLevel === "medium" ? "bg-warning/80 text-warning-foreground" :
          "bg-destructive/80 text-destructive-foreground"}`
          }>
            {deal.riskLevel.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{deal.title}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {deal.district}, {deal.city}
          </p>
        </div>

        {/* Funding Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              Raised: <span className="font-semibold text-foreground">${(deal.raisedAmount / 1e6).toFixed(1)}M</span>
            </span>
            <span className="font-bold text-primary">{fillPct}%</span>
          </div>
          <Progress value={fillPct} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Target: ${(deal.targetRaise / 1e6).toFixed(1)}M</span>
            <span>{deal.investorCount}/{deal.maxInvestors} investors</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {[
          { label: "Proj. ROI", value: `${deal.projectedROI}%`, color: "text-success" },
          { label: "IRR", value: `${deal.projectedIRR}%`, color: "text-primary" },
          { label: "Hold", value: `${deal.holdingPeriod}yr`, color: "text-foreground" }].
          map((m) =>
          <div key={m.label} className="rounded-lg bg-secondary/50 p-2 text-center">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-muted-foreground">
            Min: <span className="font-semibold text-foreground">${deal.minInvestment.toLocaleString()}</span>
            {deal.status !== "funded" && days > 0 &&
            <span className="ml-2">· <Clock className="w-3 h-3 inline" /> {days}d left</span>
            }
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            View Deal <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Investment Score compact */}
        <div className="border-t border-border pt-3">
          <InvestmentScore input={{
            price: deal.askingPrice,
            aiValuation: deal.aiValuation,
            rentalYield: deal.rentalYield,
            city: deal.city,
            district: deal.district,
            propertyType: deal.propertyType,
            developerRating: deal.developerRating,
            verified: deal.verified
          }} compact />
        </div>
      </div>
    </div>);

}

// ── Main Page ──
export default function SyndicationDeals() {
  const [filter, setFilter] = useState<"all" | "open" | "closing_soon" | "funded">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const filtered = syndicationDeals.filter((d) => {
    const statusMatch = filter === "all" || d.status === filter;
    const riskMatch = riskFilter === "all" || d.riskLevel === riskFilter;
    return statusMatch && riskMatch;
  });

  const totalRaised = syndicationDeals.reduce((s, d) => s + d.raisedAmount, 0);
  const totalTarget = syndicationDeals.reduce((s, d) => s + d.targetRaise, 0);
  const openDeals = syndicationDeals.filter((d) => d.status === "open" || d.status === "closing_soon").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Investor Syndication
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Co-invest in institutional-quality real estate deals with curated Iraqi developers.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 self-start sm:self-auto">
          <Shield className="w-3 h-3 mr-1" /> SEC-Equivalent Structure
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Raised" value={`$${(totalRaised / 1e6).toFixed(1)}M`} change={`of $${(totalTarget / 1e6).toFixed(0)}M target`} icon={DollarSign} trend="up" />
        <StatsCard title="Open Deals" value={openDeals} change="Available now" icon={Building2} />
        <StatsCard title="Avg Proj. ROI" value="14.4%" change="+2.1% vs market" icon={TrendingUp} trend="up" />
        <StatsCard title="Active Investors" value={syndicationDeals.reduce((s, d) => s + d.investorCount, 0)} icon={Users} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-xl p-1 bg-muted">
          {(["all", "open", "closing_soon", "funded"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`
            }>
            
              {f === "all" ? "All" : f === "closing_soon" ? "Closing Soon" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>
        <div className="flex gap-1 rounded-xl p-1 bg-muted">
          {(["all", "low", "medium", "high"] as const).map((r) =>
          <button
            key={r}
            onClick={() => setRiskFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            riskFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`
            }>
            
              {r === "all" ? "All Risk" : `${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
            </button>
          )}
        </div>
      </div>

      {/* Deal Grid */}
      {filtered.length === 0 ?
      <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No deals match your filters</p>
        </div> :

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
          {filtered.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      }

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Are you a developer with a deal?</p>
          <p className="text-sm text-muted-foreground mt-0.5">List your project on TerraVista Syndication and reach 500+ verified investors.</p>
        </div>
        <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-sm shrink-0">
          Submit a Deal
        </Button>
      </div>
    </div>);

}