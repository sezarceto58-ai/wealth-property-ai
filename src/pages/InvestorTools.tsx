import { Brain, DollarSign, TrendingUp, BarChart3, AlertTriangle, Calculator } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import PlanGate from "@/components/PlanGate";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BadgeCheck, MapPin, Search, Globe, Shield, Building2, Target } from "lucide-react";
import TerraScore from "@/components/TerraScore";
import { mockProperties } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Portfolio data ──
const portfolioItems = [
  { name: "Erbil Villa Portfolio",     value: 1240000, roi: 12.4, irr: 8.2,  risk: "low"    as const },
  { name: "Baghdad Commercial",         value: 890000,  roi: 9.1,  irr: 6.8,  risk: "medium" as const },
  { name: "Basra Residential Block",    value: 560000,  roi: 15.3, irr: 11.1, risk: "medium" as const },
  { name: "Sulaymaniyah Mixed-Use",     value: 340000,  roi: 7.8,  irr: 5.4,  risk: "high"   as const },
];
const riskColors: Record<string, string> = {
  low: "text-success bg-success/10", medium: "text-warning bg-warning/10", high: "text-destructive bg-destructive/10",
};
const marketCompare = [
  { city: "Baghdad",      avgPrice: 1850, growth: 4.2, demand: "High",      peRatio: 18.5, volatility: "Medium", esg: 62 },
  { city: "Erbil",        avgPrice: 2200, growth: 7.8, demand: "Very High", peRatio: 15.2, volatility: "Low",    esg: 71 },
  { city: "Basra",        avgPrice: 1400, growth: 3.1, demand: "Medium",    peRatio: 22.1, volatility: "High",   esg: 55 },
  { city: "Sulaymaniyah", avgPrice: 1650, growth: 5.5, demand: "High",      peRatio: 19.8, volatility: "Medium", esg: 67 },
];

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
  const totalInterest = monthly * months - loanAmount;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Mortgage Calculator</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-muted-foreground">Property Price ($)</label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
        <div><label className="text-xs text-muted-foreground">Down Payment (%)</label><Input type="number" value={down} onChange={e => setDown(Number(e.target.value))} /></div>
        <div><label className="text-xs text-muted-foreground">Interest Rate (%)</label><Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value))} /></div>
        <div><label className="text-xs text-muted-foreground">Loan Term (Years)</label><Input type="number" value={years} onChange={e => setYears(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-primary/5 p-3 text-center"><p className="text-xs text-muted-foreground">Monthly</p><p className="text-lg font-bold text-primary">${monthly.toFixed(0)}</p></div>
        <div className="rounded-xl bg-success/5 p-3 text-center"><p className="text-xs text-muted-foreground">Total Interest</p><p className="text-lg font-bold text-success">${(totalInterest / 1000).toFixed(0)}K</p></div>
        <div className="rounded-xl bg-warning/5 p-3 text-center"><p className="text-xs text-muted-foreground">Loan Amount</p><p className="text-lg font-bold text-warning">${(loanAmount / 1000).toFixed(0)}K</p></div>
      </div>
    </div>
  );
}

function AIPropertyAnalysis() {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isBuyerView = location.pathname.startsWith("/buyer");

  const runAnalysis = async () => {
    if (isBuyerView) { navigate(`/buyer/analysis/${selectedProperty.id}`); return; }
    setLoading(true); setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", { body: { type: "full_analysis", property: selectedProperty } });
      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockProperties.slice(0, 4).map((p) => {
          const diff = ((p.aiValuation - p.price) / p.price) * 100;
          return (
            <button key={p.id} onClick={() => { setSelectedProperty(p); setAnalysis(null); }}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all ${selectedProperty.id === p.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute top-2 left-2"><TerraScore score={p.terraScore} size="sm" /></div>
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold ${diff >= 0 ? "bg-success/90 text-white" : "bg-warning/90 text-white"}`}>
                  {diff >= 0 ? "📈 KEEP" : "📉 SELL"}
                </div>
              </div>
              <div className="p-3 bg-card">
                <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{p.district}, {p.city}</p>
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-bold text-foreground">${p.price.toLocaleString()}</p>
                  <p className={`text-xs font-semibold ${diff >= 0 ? "text-success" : "text-destructive"}`}>{diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs AI</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Button onClick={runAnalysis} disabled={loading} size="lg" className="w-full sm:w-auto bg-gradient-gold text-white hover:opacity-90 shadow-gold rounded-xl">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4 mr-2" />{isBuyerView ? `Open ${selectedProperty.title} Analysis` : `Analyze ${selectedProperty.title}`}</>}
      </Button>
      {!isBuyerView && analysis && <div className="rounded-xl bg-card border border-border p-5"><p className="text-sm text-foreground whitespace-pre-wrap">{JSON.stringify(analysis, null, 2)}</p></div>}
    </div>
  );
}

export default function InvestorTools() {
  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const avgROI = (portfolioItems.reduce((s, i) => s + i.roi, 0) / portfolioItems.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Investor Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered portfolio tools, financial analysis, and market intelligence.</p>
      </div>

      {/* Mortgage calculator is free */}
      <MortgageCalculator />

      {/* Everything else is Elite */}
      <PlanGate requiredTier="elite" featureLabel="Investor Portfolio Tools">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Portfolio Value" value={`$${(totalValue / 1e6).toFixed(1)}M`} change="+8.3% YoY" icon={DollarSign} trend="up" />
            <StatsCard title="Avg ROI" value={`${avgROI}%`} change="+1.2%" icon={TrendingUp} trend="up" />
            <StatsCard title="Properties" value={portfolioItems.length} icon={BarChart3} />
            <StatsCard title="Risk Score" value="Medium" icon={AlertTriangle} trend="neutral" />
          </div>

          <Tabs defaultValue="ai">
            <TabsList className="bg-secondary rounded-xl p-1 h-auto flex-wrap">
              <TabsTrigger value="ai" className="rounded-lg text-xs gap-1"><Brain className="w-3 h-3" /> AI Analysis</TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-lg text-xs gap-1"><BarChart3 className="w-3 h-3" /> Portfolio</TabsTrigger>
              <TabsTrigger value="market" className="rounded-lg text-xs gap-1"><Globe className="w-3 h-3" /> Market Intel</TabsTrigger>
            </TabsList>

            <TabsContent value="ai"><AIPropertyAnalysis /></TabsContent>

            <TabsContent value="portfolio">
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Portfolio Holdings</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-secondary/20">
                      {["Asset", "Value", "ROI", "IRR", "Risk"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {portfolioItems.map(item => (
                        <tr key={item.name} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-4 py-3">${item.value.toLocaleString()}</td>
                          <td className="px-4 py-3 text-success font-medium">{item.roi}%</td>
                          <td className="px-4 py-3">{item.irr}%</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${riskColors[item.risk]}`}>{item.risk}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="market">
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Multi-Market Intelligence</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-secondary/20">
                      {["City","Avg $/m²","Growth","P/E","Volatility","ESG","Demand"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {marketCompare.map(m => (
                        <tr key={m.city} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium text-foreground">{m.city}</td>
                          <td className="px-4 py-3">${m.avgPrice}</td>
                          <td className="px-4 py-3 text-success font-medium">+{m.growth}%</td>
                          <td className="px-4 py-3">{m.peRatio}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${m.volatility === "Low" ? "bg-success/10 text-success" : m.volatility === "Medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>{m.volatility}</span></td>
                          <td className="px-4 py-3">{m.esg}/100</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.demand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PlanGate>
    </div>
  );
}
