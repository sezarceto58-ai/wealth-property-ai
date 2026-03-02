import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp, DollarSign, BarChart3, AlertTriangle, Brain, Calculator,
  Globe, Search, Shield, Building2, MapPin, Target, Zap, ChevronRight,
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, BadgeCheck,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import TerraScore from "@/components/TerraScore";
import { mockProperties } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Portfolio Data ──
const portfolioItems = [
  { name: "Erbil Villa Portfolio", value: 1240000, roi: 12.4, irr: 8.2, risk: "low" as const },
  { name: "Baghdad Commercial", value: 890000, roi: 9.1, irr: 6.8, risk: "medium" as const },
  { name: "Basra Residential Block", value: 560000, roi: 15.3, irr: 11.1, risk: "medium" as const },
  { name: "Sulaymaniyah Mixed-Use", value: 340000, roi: 7.8, irr: 5.4, risk: "high" as const },
];

const riskColors: Record<string, string> = {
  low: "text-success bg-success/10",
  medium: "text-warning bg-warning/10",
  high: "text-destructive bg-destructive/10",
};

const marketCompare = [
  { city: "Baghdad", avgPrice: 1850, growth: 4.2, demand: "High", peRatio: 18.5, volatility: "Medium", esg: 62 },
  { city: "Erbil", avgPrice: 2200, growth: 7.8, demand: "Very High", peRatio: 15.2, volatility: "Low", esg: 71 },
  { city: "Basra", avgPrice: 1400, growth: 3.1, demand: "Medium", peRatio: 22.1, volatility: "High", esg: 55 },
  { city: "Sulaymaniyah", avgPrice: 1650, growth: 5.5, demand: "High", peRatio: 19.8, volatility: "Medium", esg: 67 },
];

// ── Mortgage Calculator Component ──
function MortgageCalculator() {
  const [price, setPrice] = useState(300000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(7.5);
  const [years, setYears] = useState(20);

  const loanAmount = price * (1 - down / 100);
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const monthly = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : loanAmount / months;
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="rounded-xl bg-card border border-border p-6 space-y-5">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" /> Mortgage Calculator
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Property Price ($)</label>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Down Payment (%)</label>
          <Input type="number" value={down} onChange={(e) => setDown(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Interest Rate (%)</label>
          <Input type="number" value={rate} step="0.1" onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Loan Term (Years)</label>
          <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Monthly Payment</p>
          <p className="text-lg font-bold text-primary">${monthly.toFixed(0)}</p>
        </div>
        <div className="rounded-lg bg-success/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Interest</p>
          <p className="text-lg font-bold text-success">${(totalInterest / 1000).toFixed(0)}K</p>
        </div>
        <div className="rounded-lg bg-warning/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Payment</p>
          <p className="text-lg font-bold text-warning">${(totalPayment / 1000).toFixed(0)}K</p>
        </div>
      </div>
    </div>
  );
}

// ── Property Card for AI Analysis ──
function PropertyInvestmentCard({ property, isSelected, onSelect }: {
  property: typeof mockProperties[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const valuationDiff = property.aiValuation - property.price;
  const valuationPercent = Math.round((valuationDiff / property.price) * 100);
  const recommendation = valuationDiff > 0 ? "KEEP" : "SELL";

  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left group ${
        isSelected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Recommendation badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
          recommendation === "KEEP"
            ? "bg-success/90 text-success-foreground"
            : "bg-warning/90 text-warning-foreground"
        }`}>
          {recommendation === "KEEP" ? "📈 KEEP" : "📉 SELL"}
        </div>

        {/* TerraScore */}
        <div className="absolute top-3 left-3">
          <TerraScore score={property.terraScore} size="sm" />
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
            ANALYZING
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-card">
        <h4 className="text-sm font-semibold text-foreground truncate">{property.title}</h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {property.district}, {property.city}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-bold text-foreground">${property.price.toLocaleString()}</p>
          <p className={`text-xs font-semibold ${valuationDiff >= 0 ? "text-success" : "text-destructive"}`}>
            {valuationDiff >= 0 ? "+" : ""}{valuationPercent}% AI Val
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span>{property.propertyType}</span>
          <span>•</span>
          <span>{property.area}m²</span>
          {property.verified && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-primary">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// ── AI Analysis Results Page ──
function AIAnalysisResults({ analysis, property }: { analysis: any; property: typeof mockProperties[0] }) {
  const recommendation = analysis.recommendation;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero Recommendation */}
      <div className={`rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
        recommendation === "BUY" || recommendation === "KEEP" ? "bg-success/10 border border-success/20" :
        recommendation === "HOLD" ? "bg-warning/10 border border-warning/20" :
        "bg-destructive/10 border border-destructive/20"
      }`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
          recommendation === "BUY" || recommendation === "KEEP" ? "bg-success/20" :
          recommendation === "HOLD" ? "bg-warning/20" : "bg-destructive/20"
        }`}>
          <Target className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-lg font-bold ${
              recommendation === "BUY" || recommendation === "KEEP" ? "text-success" :
              recommendation === "HOLD" ? "text-warning" : "text-destructive"
            }`}>
              AI Recommendation: {recommendation}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">For</p>
          <p className="text-sm font-semibold text-foreground">{property.title}</p>
        </div>
      </div>

      {/* Investment Score */}
      {analysis.investmentScore && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Investment Scoring
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(analysis.investmentScore).map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 flex items-center justify-center mb-2 bg-primary/5">
                  <span className="text-lg font-bold text-primary">{String(val)}</span>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWOT */}
      {analysis.swot && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> SWOT Analysis
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((key) => {
              const config = {
                strengths: { bg: "bg-success/10", text: "text-success", icon: "✅" },
                weaknesses: { bg: "bg-destructive/10", text: "text-destructive", icon: "⚠️" },
                opportunities: { bg: "bg-primary/10", text: "text-primary", icon: "🚀" },
                threats: { bg: "bg-warning/10", text: "text-warning", icon: "🔥" },
              };
              const c = config[key];
              return (
                <div key={key} className={`rounded-xl p-4 ${c.bg}`}>
                  <p className={`text-xs font-bold uppercase mb-2 flex items-center gap-1.5 ${c.text}`}>
                    <span>{c.icon}</span> {key}
                  </p>
                  <ul className="text-xs space-y-1.5">
                    {(analysis.swot[key] || []).map((item: string, i: number) => (
                      <li key={i} className="text-foreground/80">• {item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financials */}
      {analysis.financials && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Financial Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "ROI", value: analysis.financials.estimatedROI },
              { label: "IRR", value: analysis.financials.estimatedIRR },
              { label: "Cap Rate", value: analysis.financials.capRate },
              { label: "DSCR", value: analysis.financials.dscr },
              { label: "NOI", value: `$${(analysis.financials.noi || 0).toLocaleString()}` },
              { label: "Cash Flow", value: `$${(analysis.financials.annualCashFlow || 0).toLocaleString()}` },
              { label: "GDV", value: `$${(analysis.financials.gdv || 0).toLocaleString()}` },
              { label: "P/E Ratio", value: analysis.financials.peRatio },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className="text-sm font-bold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {analysis.risk && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Risk Assessment
            <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-bold ${riskColors[analysis.risk.level] || "bg-secondary text-muted-foreground"}`}>
              {analysis.risk.level?.toUpperCase()} · {analysis.risk.overallScore}/100
            </span>
          </h4>
          <div className="space-y-3">
            {(analysis.risk.factors || []).map((f: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{f.name}</span>
                  <span className="text-muted-foreground">{f.score}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      f.score > 70 ? "bg-destructive" : f.score > 40 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographics */}
      {analysis.demographics && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Area Demographics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Population", value: analysis.demographics.population },
              { label: "Median Income", value: analysis.demographics.medianIncome },
              { label: "Employment", value: analysis.demographics.employmentRate },
              { label: "Growth", value: analysis.demographics.growthRate },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{d.label}</p>
                <p className="text-sm font-bold text-foreground">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ESG Score */}
      {analysis.esg && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> ESG Score
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Overall", value: analysis.esg.score },
              { label: "Environmental", value: analysis.esg.environmental },
              { label: "Social", value: analysis.esg.social },
              { label: "Governance", value: analysis.esg.governance },
            ].map((e) => (
              <div key={e.label} className="text-center">
                <div className={`w-14 h-14 mx-auto rounded-full border-4 flex items-center justify-center mb-1 bg-card ${
                  Number(e.value) >= 70 ? "border-success/40" : Number(e.value) >= 50 ? "border-warning/40" : "border-destructive/40"
                }`}>
                  <span className="text-sm font-bold">{e.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.label}</p>
              </div>
            ))}
          </div>
          {analysis.esg.notes && <p className="text-xs text-muted-foreground mt-3">{analysis.esg.notes}</p>}
        </div>
      )}

      {/* Developer Reputation */}
      {analysis.developerReputation && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Developer Reputation
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="text-sm font-bold text-primary">{"⭐".repeat(Math.round(analysis.developerReputation.rating || 0))} {analysis.developerReputation.rating}/5</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm font-bold text-foreground">{analysis.developerReputation.completedProjects} projects</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">On-Time</p>
              <p className="text-sm font-bold text-foreground">{analysis.developerReputation.onTimeDelivery}</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Quality</p>
              <p className="text-sm font-bold text-foreground">{analysis.developerReputation.qualityScore}/100</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Analysis Component ──
function AIPropertyAnalysis() {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isBuyerView = location.pathname.startsWith("/buyer");

  const runAnalysis = async () => {
    if (isBuyerView) {
      navigate(`/buyer/analysis/${selectedProperty.id}`);
      return;
    }

    setLoading(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: { type: "full_analysis", property: selectedProperty },
      });
      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message || "Try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Cards Grid */}
      <div>
        <h3 className="font-semibold text-foreground mb-1 text-sm">Your Investment Properties</h3>
        <p className="text-xs text-muted-foreground mb-4">Select a property to run AI analysis. Cards show sell/keep recommendation based on AI valuation.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockProperties.map((p) => (
            <PropertyInvestmentCard
              key={p.id}
              property={p}
              isSelected={selectedProperty.id === p.id}
              onSelect={() => { setSelectedProperty(p); setAnalysis(null); }}
            />
          ))}
        </div>
      </div>

      {/* Run Analysis Button */}
      <Button
        onClick={runAnalysis}
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold rounded-xl"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {loading ? "Analyzing with TerraVista AI..." : isBuyerView ? `Open ${selectedProperty.title} Analysis Page` : `Analyze ${selectedProperty.title}`}
      </Button>

      {/* Results */}
      {!isBuyerView && analysis && !analysis.raw && (
        <AIAnalysisResults analysis={analysis} property={selectedProperty} />
      )}

      {!isBuyerView && analysis?.raw && (
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-sm text-foreground whitespace-pre-wrap">{analysis.raw}</p>
        </div>
      )}
    </div>
  );
}

// ── Smart Search Component ──
function SmartSearch() {
  const [criteria, setCriteria] = useState({
    budgetMin: 100000, budgetMax: 500000,
    propertyType: "Villa", location: "Erbil",
    targetROI: 10, expectedIRR: 8, maxRisk: "medium",
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const runSearch = async () => {
    setLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: { type: "smart_search", property: mockProperties, criteria },
      });
      if (error) throw error;
      setResults(data.analysis);
    } catch (e: any) {
      toast({ title: "Search Failed", description: e.message || "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Investment Criteria
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Min Budget ($)</label>
            <Input type="number" value={criteria.budgetMin} onChange={(e) => setCriteria({ ...criteria, budgetMin: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Max Budget ($)</label>
            <Input type="number" value={criteria.budgetMax} onChange={(e) => setCriteria({ ...criteria, budgetMax: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Property Type</label>
            <select
              value={criteria.propertyType}
              onChange={(e) => setCriteria({ ...criteria, propertyType: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option>Villa</option>
              <option>Apartment</option>
              <option>Commercial</option>
              <option>Penthouse</option>
              <option>Land</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Location</label>
            <select
              value={criteria.location}
              onChange={(e) => setCriteria({ ...criteria, location: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option>Erbil</option>
              <option>Baghdad</option>
              <option>Basra</option>
              <option>Sulaymaniyah</option>
              <option>Any</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Target ROI (%)</label>
            <Input type="number" value={criteria.targetROI} onChange={(e) => setCriteria({ ...criteria, targetROI: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Expected IRR (%)</label>
            <Input type="number" value={criteria.expectedIRR} onChange={(e) => setCriteria({ ...criteria, expectedIRR: Number(e.target.value) })} />
          </div>
        </div>
        <button
          onClick={runSearch}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? "AI is searching..." : "Find Matching Properties"}
        </button>
      </div>

      {results && (
        <div className="space-y-3 animate-fade-in">
          {results.marketAdvice && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <p className="text-xs font-semibold text-primary mb-1">AI Market Advice</p>
              <p className="text-sm text-foreground">{results.marketAdvice}</p>
            </div>
          )}
          {(results.matches || []).map((m: any) => {
            const prop = mockProperties.find((p) => p.id === m.propertyId);
            return prop ? (
              <div
                key={m.propertyId}
                onClick={() => navigate(`/property/${prop.id}`)}
                className="rounded-xl bg-card border border-border p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors"
              >
                <img src={prop.image} alt={prop.title} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                  <p className="text-xs text-muted-foreground">{prop.city} · ${prop.price.toLocaleString()}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(m.matchReasons || []).slice(0, 2).map((r: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px]">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{m.matchScore}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Match</p>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function InvestorTools() {
  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const avgROI = (portfolioItems.reduce((s, i) => s + i.roi, 0) / portfolioItems.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Investor Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered analysis, financial tools, and market intelligence.</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">⭐ Elite</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Portfolio Value" value={`$${(totalValue / 1e6).toFixed(1)}M`} change="+8.3% YoY" icon={DollarSign} trend="up" />
        <StatsCard title="Avg ROI" value={`${avgROI}%`} change="+1.2%" icon={TrendingUp} trend="up" />
        <StatsCard title="Properties" value={portfolioItems.length} icon={BarChart3} />
        <StatsCard title="Risk Score" value="Medium" icon={AlertTriangle} trend="neutral" />
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="bg-secondary rounded-xl p-1 h-auto flex-wrap">
          <TabsTrigger value="ai" className="rounded-lg text-xs gap-1"><Brain className="w-3 h-3" /> AI Analysis</TabsTrigger>
          <TabsTrigger value="search" className="rounded-lg text-xs gap-1"><Search className="w-3 h-3" /> Smart Search</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg text-xs gap-1"><BarChart3 className="w-3 h-3" /> Portfolio</TabsTrigger>
          <TabsTrigger value="market" className="rounded-lg text-xs gap-1"><Globe className="w-3 h-3" /> Market Intel</TabsTrigger>
          <TabsTrigger value="calculator" className="rounded-lg text-xs gap-1"><Calculator className="w-3 h-3" /> Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="ai"><AIPropertyAnalysis /></TabsContent>
        <TabsContent value="search"><SmartSearch /></TabsContent>

        <TabsContent value="portfolio">
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Portfolio Holdings</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ROI</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">IRR</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioItems.map((item) => (
                    <tr key={item.name} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground">{item.name}</td>
                      <td className="px-5 py-4 text-right text-foreground">${item.value.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-success font-medium">{item.roi}%</td>
                      <td className="px-5 py-4 text-right text-foreground">{item.irr}%</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${riskColors[item.risk]}`}>{item.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market">
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Multi-Market Intelligence</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">City</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg $/m²</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Growth</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">P/E</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Volatility</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ESG</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {marketCompare.map((m) => (
                    <tr key={m.city} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground">{m.city}</td>
                      <td className="px-5 py-4 text-right text-foreground">${m.avgPrice}</td>
                      <td className="px-5 py-4 text-right text-success font-medium">+{m.growth}%</td>
                      <td className="px-5 py-4 text-right text-foreground">{m.peRatio}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          m.volatility === "Low" ? "bg-success/10 text-success" :
                          m.volatility === "Medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                        }`}>{m.volatility}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-foreground">{m.esg}/100</td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{m.demand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calculator"><MortgageCalculator /></TabsContent>
      </Tabs>
    </div>
  );
}
