/**
 * Syndication Deal Detail Page — Module 4
 * Full deal page with investment slots, investor list, and commitment flow.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Users, DollarSign, TrendingUp, Clock, BadgeCheck,
  Target, Shield, Building2, MapPin, CheckCircle, AlertTriangle,
  ChevronRight, Zap, Star, Lock, Calendar, Percent, BarChart3,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InvestmentScore from "@/components/InvestmentScore";
import { syndicationDeals } from "@/pages/SyndicationDeals";
import { useToast } from "@/hooks/use-toast";
import { trackSyndicationView, trackInvestmentIntent } from "@/services/dataMoat";

// ── Mock investor list ──
const mockInvestors = [
  { name: "Ahmed Al-R.", location: "Dubai, UAE", amount: 150000, date: "2026-01-10", badge: "Elite" },
  { name: "Sara M.", location: "Erbil, Iraq", amount: 75000, date: "2026-01-15", badge: "Pro" },
  { name: "Michael K.", location: "London, UK", amount: 200000, date: "2026-01-18", badge: "Elite" },
  { name: "Nour H.", location: "Baghdad, Iraq", amount: 50000, date: "2026-01-22", badge: "Pro" },
  { name: "James T.", location: "Toronto, Canada", amount: 100000, date: "2026-02-01", badge: "Elite" },
  { name: "Layla A.", location: "Sulaymaniyah, Iraq", amount: 35000, date: "2026-02-08", badge: "Pro" },
];

// ── Deal Distribution Timeline ──
const distributionSchedule = [
  { quarter: "Q2 2026", type: "Capital Deployment", amount: null, note: "Funds deployed to construction" },
  { quarter: "Q4 2026", type: "First Distribution", amount: 4.2, note: "Rental income begins (hotel management)" },
  { quarter: "Q2 2027", type: "Distribution", amount: 4.5, note: "Stabilized yield period" },
  { quarter: "Q4 2027", type: "Distribution", amount: 4.8, note: "Occupancy target 92%+" },
  { quarter: "2028-2030", type: "Annual Distributions", amount: 5.0, note: "Full operating cycle" },
  { quarter: "Q4 2030", type: "Exit / Sale", amount: null, note: "Target exit via portfolio sale or IPO" },
];

function daysRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 86400000));
}

export default function SyndicationDealDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const deal = syndicationDeals.find(d => d.id === id);
  const [investAmount, setInvestAmount] = useState(deal?.minInvestment ?? 25000);
  const [committed, setCommitted] = useState(false);
  const [showCommitFlow, setShowCommitFlow] = useState(false);

  // Data Moat tracking
  useEffect(() => {
    if (deal) trackSyndicationView(deal.id, deal.title, deal.targetRaise);
  }, [deal?.id]);

  if (!deal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Deal not found.</p>
        <Link to="/buyer/syndication" className="text-primary text-sm mt-2 inline-block">← Back to deals</Link>
      </div>
    );
  }

  const fillPct = Math.round((deal.raisedAmount / deal.targetRaise) * 100);
  const remaining = deal.targetRaise - deal.raisedAmount;
  const days = daysRemaining(deal.closeDate);
  const slots = deal.maxInvestors - deal.investorCount;

  const projectedReturn = investAmount * (1 + deal.projectedROI / 100 * deal.holdingPeriod);
  const annualIncome = investAmount * (deal.rentalYield / 100);

  const handleCommit = () => {
    if (investAmount < deal.minInvestment) {
      toast({ title: "Below Minimum", description: `Minimum investment is $${deal.minInvestment.toLocaleString()}`, variant: "destructive" });
      return;
    }
    if (investAmount > deal.maxInvestment) {
      toast({ title: "Above Maximum", description: `Maximum investment is $${deal.maxInvestment.toLocaleString()}`, variant: "destructive" });
      return;
    }
    setCommitted(true);
    setShowCommitFlow(false);
    trackInvestmentIntent(deal.id, investAmount, deal.city);
    toast({ title: "🎉 Commitment Received!", description: `Your interest of $${investAmount.toLocaleString()} has been registered. Our team will contact you within 24h.` });
  };

  const statusConfig = {
    open: { label: "Open for Investment", color: "bg-success/10 text-success border-success/20" },
    closing_soon: { label: "Closing Soon", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    funded: { label: "Fully Funded", color: "bg-primary/10 text-primary border-primary/20" },
    active: { label: "Active", color: "bg-success/10 text-success border-success/20" },
    exited: { label: "Exited", color: "bg-secondary text-muted-foreground border-border" },
  };
  const sc = statusConfig[deal.status];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/buyer/syndication" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Syndication Deals
      </Link>

      {/* Hero */}
      <div className="rounded-xl overflow-hidden">
        <div className="relative aspect-[21/9]">
          <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${sc.color}`}>{sc.label}</span>
              {deal.verified && (
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-primary/80 text-primary-foreground flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> Verified Deal
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                deal.riskLevel === "low" ? "bg-success/80 text-success-foreground" :
                deal.riskLevel === "medium" ? "bg-warning/80 text-warning-foreground" :
                "bg-destructive/80 text-destructive-foreground"
              }`}>{deal.riskLevel.toUpperCase()} RISK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{deal.title}</h1>
            <p className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" /> {deal.district}, {deal.city}
              <span className="mx-1">·</span>
              <Building2 className="w-4 h-4" /> {deal.propertyType}
              <span className="mx-1">·</span>
              <span>{deal.developer}</span>
              <span className="flex items-center gap-0.5 text-warning">
                <Star className="w-3.5 h-3.5 fill-current" /> {deal.developerRating}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-5">
          <Tabs defaultValue="overview">
            <TabsList className="bg-secondary rounded-xl p-1 h-auto">
              <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
              <TabsTrigger value="financials" className="rounded-lg text-xs">Financials</TabsTrigger>
              <TabsTrigger value="investors" className="rounded-lg text-xs">Investors</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg text-xs">Timeline</TabsTrigger>
              <TabsTrigger value="score" className="rounded-lg text-xs">Deal Score</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-2">About This Deal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{deal.description}</p>
              </div>

              {/* Highlights */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Deal Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deal.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-success/5 border border-success/10">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Key Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Asking Price", value: `$${(deal.askingPrice / 1e6).toFixed(2)}M` },
                    { label: "AI Valuation", value: `$${(deal.aiValuation / 1e6).toFixed(2)}M` },
                    { label: "Discount to AI Val", value: `${Math.round(((deal.aiValuation - deal.askingPrice) / deal.aiValuation) * 100)}%` },
                    { label: "Target Raise", value: `$${(deal.targetRaise / 1e6).toFixed(1)}M` },
                    { label: "Rental Yield", value: `${deal.rentalYield}%` },
                    { label: "Hold Period", value: `${deal.holdingPeriod} years` },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Financials */}
            <TabsContent value="financials" className="space-y-4 mt-4">
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Return Projections
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Projected Total ROI", value: `${deal.projectedROI}%`, color: "text-success" },
                    { label: "Target IRR", value: `${deal.projectedIRR}%`, color: "text-primary" },
                    { label: "Annual Rental Yield", value: `${deal.rentalYield}%`, color: "text-success" },
                    { label: "Hold Period", value: `${deal.holdingPeriod} Years`, color: "text-foreground" },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl bg-secondary/50 p-4 text-center">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className={`text-xl font-black mt-1 ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scenario calculator */}
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" /> Return Calculator
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Investment Amount ($)</label>
                    <Input
                      type="number"
                      value={investAmount}
                      min={deal.minInvestment}
                      max={deal.maxInvestment}
                      step={5000}
                      onChange={e => setInvestAmount(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Min: ${deal.minInvestment.toLocaleString()} · Max: ${deal.maxInvestment.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-success/5 border border-success/20 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Annual Income</p>
                      <p className="text-base font-bold text-success">${annualIncome.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Total Return</p>
                      <p className="text-base font-bold text-primary">${projectedReturn.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Net Profit</p>
                      <p className="text-base font-bold text-warning">${(projectedReturn - investAmount).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Investors */}
            <TabsContent value="investors" className="space-y-4 mt-4">
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Co-Investors ({deal.investorCount})
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {slots} slots remaining
                  </Badge>
                </div>
                <div className="divide-y divide-border">
                  {mockInvestors.slice(0, deal.investorCount).map((inv, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{inv.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${inv.amount.toLocaleString()}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          inv.badge === "Elite" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                        }`}>{inv.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {slots > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{slots} slots</span> remaining. Minimum investment ${deal.minInvestment.toLocaleString()}.
                    Investor identities are partially anonymized for privacy.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Timeline */}
            <TabsContent value="timeline" className="space-y-4 mt-4">
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Distribution Schedule
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {distributionSchedule.map((d, i) => (
                      <div key={i} className="flex gap-4 pl-10 relative">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-primary bg-background top-1" />
                        <div className="flex-1 rounded-xl border border-border bg-secondary/30 p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-primary">{d.quarter}</p>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{d.type}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>
                            </div>
                            {d.amount && (
                              <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground">Yield</p>
                                <p className="text-sm font-bold text-success">{d.amount}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Deal Score */}
            <TabsContent value="score" className="mt-4">
              <InvestmentScore input={{
                price: deal.askingPrice,
                aiValuation: deal.aiValuation,
                rentalYield: deal.rentalYield,
                city: deal.city,
                district: deal.district,
                propertyType: deal.propertyType,
                developerRating: deal.developerRating,
                verified: deal.verified,
              }} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Investment panel */}
        <div className="space-y-4">
          {/* Funding Progress */}
          <div className="rounded-xl bg-card border border-border p-5 space-y-4 sticky top-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Funding Progress</span>
                <span className="text-sm font-bold text-primary">{fillPct}%</span>
              </div>
              <Progress value={fillPct} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Raised: <span className="text-foreground font-semibold">${(deal.raisedAmount / 1e6).toFixed(1)}M</span></span>
                <span>Goal: <span className="text-foreground font-semibold">${(deal.targetRaise / 1e6).toFixed(1)}M</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-secondary/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Investors</p>
                <p className="text-sm font-bold text-foreground">{deal.investorCount} / {deal.maxInvestors}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Remaining</p>
                <p className="text-sm font-bold text-foreground">${(remaining / 1e6).toFixed(1)}M</p>
              </div>
            </div>

            {days > 0 && deal.status !== "funded" && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <p className="text-xs font-medium text-orange-500">{days} days remaining to invest</p>
              </div>
            )}

            {!committed && deal.status !== "funded" && (
              <>
                {!showCommitFlow ? (
                  <Button
                    onClick={() => setShowCommitFlow(true)}
                    className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" /> Invest in This Deal
                  </Button>
                ) : (
                  <div className="space-y-3 border-t border-border pt-4">
                    <label className="text-xs font-semibold text-foreground">Investment Amount ($)</label>
                    <Input
                      type="number"
                      value={investAmount}
                      min={deal.minInvestment}
                      max={deal.maxInvestment}
                      step={5000}
                      onChange={e => setInvestAmount(Number(e.target.value))}
                    />
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex justify-between">
                        <span>Annual Income:</span>
                        <span className="text-success font-semibold">${Math.round(investAmount * deal.rentalYield / 100).toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Return ({deal.holdingPeriod}yr):</span>
                        <span className="text-primary font-semibold">${Math.round(investAmount * (1 + deal.projectedROI / 100 * deal.holdingPeriod)).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button onClick={handleCommit} className="w-full bg-success text-success-foreground hover:bg-success/90">
                      <CheckCircle className="w-4 h-4 mr-2" /> Confirm Commitment
                    </Button>
                    <button onClick={() => setShowCommitFlow(false)} className="w-full text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}
              </>
            )}

            {committed && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-center">
                <CheckCircle className="w-6 h-6 text-success mx-auto mb-1" />
                <p className="text-sm font-semibold text-success">Commitment Registered</p>
                <p className="text-xs text-muted-foreground mt-0.5">Our team will contact you within 24h with next steps.</p>
              </div>
            )}

            {deal.status === "funded" && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                <p className="text-sm font-semibold text-primary">Fully Funded</p>
                <p className="text-xs text-muted-foreground mt-0.5">This deal has reached its target raise.</p>
              </div>
            )}

            {/* Trust signals */}
            <div className="border-t border-border pt-4 space-y-2">
              {[
                { icon: Shield, text: "Escrow-protected funds" },
                { icon: BadgeCheck, text: deal.verified ? "Verified deal structure" : "Legal review pending" },
                { icon: FileText, text: "Full documents on signing" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {s.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
