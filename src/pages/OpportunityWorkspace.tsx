import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Sparkles, Loader2, TrendingUp, Shield, BarChart3,
  Building2, DollarSign, MapPin, Calendar, AlertTriangle, Target,
  Lightbulb, Scale, LineChart, Briefcase, ChevronDown, ChevronUp
} from "lucide-react";

export default function OpportunityWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [newPhase, setNewPhase] = useState({ name: "", budget: 0, start_date: "", end_date: "" });
  const [showAddPhase, setShowAddPhase] = useState(false);

  // Financial calculator state
  const [calc, setCalc] = useState({
    purchasePrice: 0, downPayment: 20, loanRate: 8, loanTerm: 20,
    monthlyRent: 0, annualExpenses: 0, appreciationRate: 5,
  });

  useEffect(() => {
    if (!user || !id) return;
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    const [{ data: oppData }, { data: phaseData }] = await Promise.all([
      supabase.from("opportunities" as any).select("*").eq("id", id!).single() as any,
      supabase.from("development_phases" as any).select("*").eq("opportunity_id", id!).order("phase_order") as any,
    ]);
    if (oppData) {
      setOpp(oppData);
      setAnalysis(oppData.ai_analysis);
      setCalc((p) => ({ ...p, purchasePrice: oppData.entry_price, monthlyRent: oppData.expected_revenue / 12 }));
    }
    setPhases(phaseData || []);
    setLoading(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-ai", {
        body: { type: "full_analysis", opportunity: opp },
      });
      if (error) throw error;
      const result = data.analysis;
      setAnalysis(result);
      await (supabase.from("opportunities" as any).update({
        ai_analysis: result,
        investment_score: result.investmentScore?.overall || 0,
      } as any).eq("id", id!) as any);
      toast.success("AI analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    }
    setAnalyzing(false);
  };

  const runPrediction = async () => {
    setPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-ai", {
        body: { type: "predictive", opportunity: opp },
      });
      if (error) throw error;
      setPredictions(data.analysis);
      toast.success("Predictions generated!");
    } catch (e: any) {
      toast.error(e.message || "Prediction failed");
    }
    setPredicting(false);
  };

  const addPhase = async () => {
    if (!newPhase.name.trim()) return;
    const { error } = await (supabase.from("development_phases" as any).insert({
      opportunity_id: id!, user_id: user!.id,
      name: newPhase.name, budget: newPhase.budget,
      start_date: newPhase.start_date || null, end_date: newPhase.end_date || null,
      phase_order: phases.length,
    } as any) as any);
    if (error) toast.error("Failed to add phase");
    else { toast.success("Phase added"); setNewPhase({ name: "", budget: 0, start_date: "", end_date: "" }); setShowAddPhase(false); fetchData(); }
  };

  const updatePhaseProgress = async (phaseId: string, progress: number) => {
    await (supabase.from("development_phases" as any).update({
      progress, status: progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "pending",
    } as any).eq("id", phaseId) as any);
    fetchData();
  };

  // Financial calculations
  const loanAmount = calc.purchasePrice * (1 - calc.downPayment / 100);
  const monthlyRate = calc.loanRate / 100 / 12;
  const totalMonths = calc.loanTerm * 12;
  const monthlyPayment = monthlyRate > 0 ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1) : loanAmount / totalMonths;
  const annualIncome = calc.monthlyRent * 12;
  const noi = annualIncome - calc.annualExpenses;
  const capRate = calc.purchasePrice > 0 ? (noi / calc.purchasePrice) * 100 : 0;
  const cashOnCash = (calc.purchasePrice * calc.downPayment / 100) > 0 ? ((noi - monthlyPayment * 12) / (calc.purchasePrice * calc.downPayment / 100)) * 100 : 0;
  const roi = calc.purchasePrice > 0 ? ((opp?.expected_revenue || 0) - calc.purchasePrice) / calc.purchasePrice * 100 : 0;

  if (loading) return <div className="space-y-4 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>;
  if (!opp) return <div className="p-6 text-center text-muted-foreground">Opportunity not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/developer/opportunities")}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold text-foreground">{opp.title}</h1>
            <Badge variant="outline" className="text-xs">{opp.investment_type.toUpperCase()}</Badge>
            <Badge variant="outline" className={`text-xs ${opp.risk_level === "low" ? "text-success" : opp.risk_level === "high" ? "text-destructive" : "text-warning"}`}>
              {opp.risk_level} risk
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {opp.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.city}</span>}
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${opp.entry_price?.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{opp.timeline_months}mo timeline</span>
          </div>
        </div>
        {opp.investment_score > 0 && (
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold ${opp.investment_score >= 70 ? "border-success text-success" : opp.investment_score >= 40 ? "border-warning text-warning" : "border-destructive text-destructive"}`}>
              {opp.investment_score}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">Score</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1">
          <TabsTrigger value="analysis" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />AI Analysis</TabsTrigger>
          <TabsTrigger value="financials" className="text-xs"><DollarSign className="w-3 h-3 mr-1" />Financials</TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs"><LineChart className="w-3 h-3 mr-1" />Predictions</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs"><Building2 className="w-3 h-3 mr-1" />Dev Tracking</TabsTrigger>
          <TabsTrigger value="legal" className="text-xs"><Scale className="w-3 h-3 mr-1" />Legal</TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {!analysis ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-foreground font-medium">Run AI Analysis</p>
              <p className="text-sm text-muted-foreground mt-1">Get SWOT, risk scoring, market insights, and investment advisory.</p>
              <Button onClick={runAnalysis} disabled={analyzing} className="mt-4 bg-gradient-gold text-primary-foreground">
                {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {analyzing ? "Analyzing..." : "Run Full Analysis"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {analysis.summary && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Recommendation: <Badge className={analysis.recommendation === "BUY" ? "bg-success text-success-foreground" : analysis.recommendation === "AVOID" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}>{analysis.recommendation}</Badge></p>
                  <p className="text-sm text-muted-foreground mt-2">{analysis.summary}</p>
                </div>
              )}

              {/* Investment Scores */}
              {analysis.investmentScore && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Investment Scoring</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(analysis.investmentScore).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className={`text-2xl font-bold ${(val as number) >= 70 ? "text-success" : (val as number) >= 40 ? "text-warning" : "text-destructive"}`}>{val as number}</div>
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SWOT */}
              {analysis.swot && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((k) => (
                    <div key={k} className="rounded-xl bg-card border border-border p-4">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{k}</h4>
                      <ul className="space-y-1">{(analysis.swot[k] || []).map((item: string, i: number) => <li key={i} className="text-sm text-foreground">• {item}</li>)}</ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk */}
              {analysis.risk && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-warning" />Risk Assessment — {analysis.risk.level?.toUpperCase()} ({analysis.risk.overallScore}/100)</h3>
                  <div className="space-y-2">
                    {(analysis.risk.factors || []).map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${f.score >= 70 ? "bg-destructive" : f.score >= 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${f.score}%` }} /></div>
                          <span className="text-xs text-muted-foreground w-8">{f.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advisory */}
              {analysis.advisory && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-warning" />AI Advisory</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(analysis.advisory).map(([k, v]) => (
                      <div key={k}><span className="font-medium text-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}:</span> <span className="text-muted-foreground">{v as string}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demographics & Market */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.demographics && (
                  <div className="rounded-xl bg-card border border-border p-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Demographics</h4>
                    {Object.entries(analysis.demographics).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1"><span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="text-foreground font-medium">{v as string}</span></div>
                    ))}
                  </div>
                )}
                {analysis.marketInsights && (
                  <div className="rounded-xl bg-card border border-border p-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Market Insights</h4>
                    {Object.entries(analysis.marketInsights).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1"><span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="text-foreground font-medium">{String(v)}</span></div>
                    ))}
                  </div>
                )}
              </div>

              {/* ESG */}
              {analysis.esg && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">ESG Score: {analysis.esg.score}/100</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xl font-bold text-success">{analysis.esg.environmental}</div><p className="text-xs text-muted-foreground">Environmental</p></div>
                    <div><div className="text-xl font-bold text-primary">{analysis.esg.social}</div><p className="text-xs text-muted-foreground">Social</p></div>
                    <div><div className="text-xl font-bold text-warning">{analysis.esg.governance}</div><p className="text-xs text-muted-foreground">Governance</p></div>
                  </div>
                </div>
              )}

              <Button onClick={runAnalysis} disabled={analyzing} variant="outline" size="sm">
                {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Re-run Analysis
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-success" />ROI / IRR Calculator</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><Label className="text-xs">Purchase Price ($)</Label><Input type="number" value={calc.purchasePrice} onChange={(e) => setCalc((p) => ({ ...p, purchasePrice: +e.target.value }))} /></div>
              <div><Label className="text-xs">Down Payment (%)</Label><Input type="number" value={calc.downPayment} onChange={(e) => setCalc((p) => ({ ...p, downPayment: +e.target.value }))} /></div>
              <div><Label className="text-xs">Loan Rate (%)</Label><Input type="number" value={calc.loanRate} onChange={(e) => setCalc((p) => ({ ...p, loanRate: +e.target.value }))} step={0.1} /></div>
              <div><Label className="text-xs">Loan Term (yrs)</Label><Input type="number" value={calc.loanTerm} onChange={(e) => setCalc((p) => ({ ...p, loanTerm: +e.target.value }))} /></div>
              <div><Label className="text-xs">Monthly Rent ($)</Label><Input type="number" value={calc.monthlyRent} onChange={(e) => setCalc((p) => ({ ...p, monthlyRent: +e.target.value }))} /></div>
              <div><Label className="text-xs">Annual Expenses ($)</Label><Input type="number" value={calc.annualExpenses} onChange={(e) => setCalc((p) => ({ ...p, annualExpenses: +e.target.value }))} /></div>
              <div><Label className="text-xs">Appreciation (%/yr)</Label><Input type="number" value={calc.appreciationRate} onChange={(e) => setCalc((p) => ({ ...p, appreciationRate: +e.target.value }))} step={0.5} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(0)}` },
              { label: "ROI", value: `${roi.toFixed(1)}%` },
              { label: "Cap Rate", value: `${capRate.toFixed(1)}%` },
              { label: "Cash-on-Cash", value: `${cashOnCash.toFixed(1)}%` },
              { label: "NOI", value: `$${noi.toLocaleString()}` },
              { label: "Annual Income", value: `$${annualIncome.toLocaleString()}` },
              { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
              { label: "Payback", value: noi > 0 ? `${(calc.purchasePrice / noi).toFixed(1)} yrs` : "N/A" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* AI financial data */}
          {analysis?.financials && (
            <div className="rounded-xl bg-card border border-border p-4">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">AI Financial Analysis</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(analysis.financials).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <p className="text-sm font-bold text-foreground">{String(v)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {!predictions ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <LineChart className="w-10 h-10 text-info mx-auto mb-3" />
              <p className="text-foreground font-medium">AI Predictive Analysis</p>
              <p className="text-sm text-muted-foreground mt-1">Forecast property appreciation, rental demand, and scenario simulations.</p>
              <Button onClick={runPrediction} disabled={predicting} className="mt-4">
                {predicting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LineChart className="w-4 h-4 mr-2" />}
                {predicting ? "Generating..." : "Generate Predictions"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Appreciation */}
              {predictions.appreciation && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Property Appreciation Forecast</h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    {Object.entries(predictions.appreciation).map(([k, v]) => (
                      <div key={k}><p className="text-lg font-bold text-success">{v as string}</p><p className="text-xs text-muted-foreground">{k.replace("year", "Year ")}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenarios */}
              {predictions.scenarios && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["optimistic", "base", "pessimistic"] as const).map((s) => {
                    const sc = predictions.scenarios[s];
                    if (!sc) return null;
                    const color = s === "optimistic" ? "border-success/30 bg-success/5" : s === "pessimistic" ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5";
                    return (
                      <div key={s} className={`rounded-xl border p-4 ${color}`}>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">{s}</h4>
                        <p className="text-xl font-bold text-foreground mt-1">{sc.roi5yr}</p>
                        <p className="text-xs text-muted-foreground">5yr ROI</p>
                        <p className="text-sm text-muted-foreground mt-2">{sc.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rental projections */}
              {predictions.rentalProjections && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Rental Income Projections</h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    {Object.entries(predictions.rentalProjections).map(([k, v]) => (
                      <div key={k}><p className="text-lg font-bold text-primary">${(v as number).toLocaleString()}</p><p className="text-xs text-muted-foreground">{k.replace("year", "Year ")}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensitivity */}
              {predictions.sensitivityAnalysis && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Sensitivity Analysis</h3>
                  <div className="space-y-2">
                    {Object.entries(predictions.sensitivityAnalysis).map(([k, v]) => (
                      <div key={k} className="text-sm"><span className="font-medium text-foreground capitalize">{k.replace(/([A-Z])/g, " $1").replace("Impact", "")}:</span> <span className="text-muted-foreground">{v as string}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk indicators */}
              {predictions.riskIndicators && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Risk Indicators</h3>
                  <div className="space-y-2">
                    {predictions.riskIndicators.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{r.factor}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${r.impact === "high" ? "text-destructive" : r.impact === "medium" ? "text-warning" : "text-success"}`}>{r.impact}</Badge>
                          <span className="text-muted-foreground">{r.probability}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={runPrediction} disabled={predicting} variant="outline" size="sm">
                {predicting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <LineChart className="w-3 h-3 mr-1" />} Re-run Predictions
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Development Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Development Phases</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddPhase(!showAddPhase)}>
              {showAddPhase ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {showAddPhase ? "Cancel" : "Add Phase"}
            </Button>
          </div>

          {showAddPhase && (
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><Label className="text-xs">Phase Name</Label><Input value={newPhase.name} onChange={(e) => setNewPhase((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Foundation" /></div>
                <div><Label className="text-xs">Budget ($)</Label><Input type="number" value={newPhase.budget} onChange={(e) => setNewPhase((p) => ({ ...p, budget: +e.target.value }))} /></div>
                <div><Label className="text-xs">Start Date</Label><Input type="date" value={newPhase.start_date} onChange={(e) => setNewPhase((p) => ({ ...p, start_date: e.target.value }))} /></div>
                <div><Label className="text-xs">End Date</Label><Input type="date" value={newPhase.end_date} onChange={(e) => setNewPhase((p) => ({ ...p, end_date: e.target.value }))} /></div>
              </div>
              <Button size="sm" onClick={addPhase}>Add Phase</Button>
            </div>
          )}

          {/* Gantt-like timeline */}
          {phases.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
              No development phases yet. Add phases to track construction progress.
            </div>
          ) : (
            <div className="space-y-2">
              {phases.map((phase, idx) => {
                const statusColor = phase.status === "completed" ? "bg-success" : phase.status === "in_progress" ? "bg-primary" : phase.status === "delayed" ? "bg-destructive" : "bg-muted";
                return (
                  <div key={phase.id} className="rounded-xl bg-card border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="text-sm font-medium text-foreground">{phase.name}</span>
                        <Badge variant="outline" className="text-[10px]">{phase.status}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">${phase.budget?.toLocaleString()}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${statusColor}`} style={{ width: `${phase.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10 text-right">{phase.progress}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {[0, 25, 50, 75, 100].map((v) => (
                        <button key={v} onClick={() => updatePhaseProgress(phase.id, v)}
                          className={`text-[10px] px-2 py-0.5 rounded border ${phase.progress === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                          {v}%
                        </button>
                      ))}
                    </div>
                    {phase.start_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {phase.start_date} → {phase.end_date || "TBD"}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Budget summary */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-bold text-foreground">${phases.reduce((s, p) => s + (p.budget || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-bold text-foreground">{phases.length > 0 ? Math.round(phases.reduce((s, p) => s + (p.progress || 0), 0) / phases.length) : 0}%</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Scale className="w-4 h-4 text-primary" />Legal & Permit Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Zoning</p>
                <p className="font-medium text-foreground">{opp.zoning || "Not specified"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Legal Status</p>
                <p className="font-medium text-foreground">{opp.legal_status || "Not specified"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Permit Status</p>
                <p className="font-medium text-foreground">{opp.permit_status || "Not specified"}</p>
              </div>
            </div>
          </div>

          {analysis?.legalIntel && (
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">AI Legal Intelligence</h4>
              {analysis.legalIntel.zoningStatus && <div className="text-sm"><span className="font-medium text-foreground">Zoning:</span> <span className="text-muted-foreground">{analysis.legalIntel.zoningStatus}</span></div>}
              {analysis.legalIntel.permitRequirements?.length > 0 && (
                <div><p className="text-sm font-medium text-foreground">Permit Requirements:</p><ul className="mt-1 space-y-1">{analysis.legalIntel.permitRequirements.map((p: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {p}</li>)}</ul></div>
              )}
              {analysis.legalIntel.restrictions?.length > 0 && (
                <div><p className="text-sm font-medium text-foreground">Restrictions:</p><ul className="mt-1 space-y-1">{analysis.legalIntel.restrictions.map((r: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {r}</li>)}</ul></div>
              )}
              {analysis.legalIntel.regulatoryAlerts?.length > 0 && (
                <div><p className="text-sm font-medium text-destructive">Regulatory Alerts:</p><ul className="mt-1 space-y-1">{analysis.legalIntel.regulatoryAlerts.map((a: string, i: number) => <li key={i} className="text-sm text-destructive/80">⚠ {a}</li>)}</ul></div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
