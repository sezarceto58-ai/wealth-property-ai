import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain, Loader2, Sparkles, TrendingUp, DollarSign, Shield,
  Users, Leaf, CheckCircle, XCircle, AlertTriangle, Target, BarChart3, ChevronDown, ChevronUp,
} from "lucide-react";

const CITIES = ["Baghdad", "Erbil", "Basra", "Sulaymaniyah", "Duhok", "Najaf", "Karbala"];
const TYPES = ["Villa", "Apartment", "Penthouse", "Commercial", "Land", "Townhouse"];

export default function SellerAIAssistant() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "en";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [form, setForm] = useState({
    propertyType: "Villa",
    city: "Erbil",
    district: "",
    bedrooms: "3",
    bathrooms: "2",
    area: "200",
    features: "",
    condition: "new",
    askingPrice: "",
    notes: "",
  });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleGenerate = async () => {
    if (!form.district || !form.area) {
      toast({ title: "Missing info", description: "Please fill in district and area.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: {
          type: "listing_assist",
          language: lang,
          property: {
            type: form.propertyType,
            city: form.city,
            district: form.district,
            bedrooms: parseInt(form.bedrooms) || 0,
            bathrooms: parseInt(form.bathrooms) || 0,
            area: parseInt(form.area) || 0,
            features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
            condition: form.condition,
            askingPrice: parseInt(form.askingPrice) || undefined,
            notes: form.notes,
          },
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
      } else {
        setResult(data.analysis);
        toast({ title: "Analysis complete", description: "Your AI listing and analysis are ready!" });
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">AI Listing Assistant</h1>
          <p className="text-muted-foreground text-sm">Create professional listings with AI-powered analysis & pricing</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5 space-y-4 h-fit sticky top-20">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Property Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">City</Label>
              <select value={form.city} onChange={(e) => update("city", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">District / Neighborhood</Label>
            <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="e.g. Dream City, Mansour" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Beds</Label>
              <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Baths</Label>
              <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Area (m²)</Label>
              <Input type="number" value={form.area} onChange={(e) => update("area", e.target.value)} min={0} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Features (comma-separated)</Label>
            <Input value={form.features} onChange={(e) => update("features", e.target.value)} placeholder="Pool, Garden, Smart Home" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Condition</Label>
              <select value={form.condition} onChange={(e) => update("condition", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="new">New Build</option>
                <option value="renovated">Renovated</option>
                <option value="good">Good</option>
                <option value="needs-work">Needs Work</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Asking Price ($)</Label>
              <Input type="number" value={form.askingPrice} onChange={(e) => update("askingPrice", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Additional Notes</Label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special features, buyer requests, context..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Brain className="w-4 h-4 mr-2" /> Generate Listing & Analysis</>}
          </Button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && (
            <div className="rounded-xl bg-card border border-border p-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Ready to Create Your Listing</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Fill in your property details and our AI will generate a professional listing with comprehensive market analysis, pricing recommendations, and investment insights.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-xl bg-card border border-border p-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing market data & generating your listing...</p>
            </div>
          )}

          {result && (
            <>
              {/* Generated Listing */}
              {result.listing && (
                <div className="rounded-xl bg-card border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generated Listing</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="text-lg font-bold text-foreground">{result.listing.title}</p>
                      {result.listing.titleAr && <p className="text-sm text-muted-foreground mt-0.5 text-right" dir="rtl">{result.listing.titleAr}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{result.listing.description}</p>
                    </div>
                    {result.listing.highlights && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Key Highlights</p>
                        <div className="flex flex-wrap gap-2">
                          {result.listing.highlights.map((h: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.listing.targetBuyer && (
                      <div>
                        <p className="text-xs text-muted-foreground">Target Buyer Profile</p>
                        <p className="text-sm text-foreground">{result.listing.targetBuyer}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {result.pricing && (
                <div className="rounded-xl bg-card border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Price Recommendation</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Recommended</p>
                      <p className="text-xl font-bold text-foreground">${result.pricing.recommendedPrice?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Range</p>
                      <p className="text-sm font-medium text-foreground">${result.pricing.priceRange?.min?.toLocaleString()} - ${result.pricing.priceRange?.max?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">$/m²</p>
                      <p className="text-xl font-bold text-foreground">${result.pricing.pricePerSqm?.toLocaleString()}</p>
                    </div>
                  </div>
                  {result.pricing.reasoning && <p className="text-sm text-muted-foreground">{result.pricing.reasoning}</p>}
                </div>
              )}

              {/* Market Trends */}
              {result.marketTrends && (
                <Section title="Market Trends" icon={<TrendingUp className="w-4 h-4" />} id="trends" expanded={expanded} toggle={toggle}>
                  {Object.entries(result.marketTrends).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* SWOT */}
              {result.swot && (
                <Section title="SWOT Analysis" icon={<BarChart3 className="w-4 h-4" />} id="swot" expanded={expanded} toggle={toggle}>
                  <div className="grid grid-cols-2 gap-3">
                    <SwotBox label="Strengths" items={result.swot.strengths} icon={<CheckCircle className="w-3.5 h-3.5 text-success" />} />
                    <SwotBox label="Weaknesses" items={result.swot.weaknesses} icon={<XCircle className="w-3.5 h-3.5 text-destructive" />} />
                    <SwotBox label="Opportunities" items={result.swot.opportunities} icon={<TrendingUp className="w-3.5 h-3.5 text-primary" />} />
                    <SwotBox label="Threats" items={result.swot.threats} icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} />
                  </div>
                </Section>
              )}

              {/* Investment Score */}
              {result.investmentScore && (
                <Section title="Investment Score" icon={<Target className="w-4 h-4" />} id="score" expanded={expanded} toggle={toggle}>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(result.investmentScore).map(([k, v]) => (
                      <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                        <p className="text-lg font-bold text-foreground">{v as number}</p>
                        <p className="text-xs text-muted-foreground capitalize">{k}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Financials */}
              {result.financials && (
                <Section title="Financial Metrics" icon={<DollarSign className="w-4 h-4" />} id="fin" expanded={expanded} toggle={toggle}>
                  {Object.entries(result.financials).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Risk */}
              {result.risk && (
                <Section title="Risk Assessment" icon={<Shield className="w-4 h-4" />} id="risk" expanded={expanded} toggle={toggle}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-foreground">{result.risk.overallScore}/100</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${result.risk.level === "low" ? "bg-success/10 text-success" : result.risk.level === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {result.risk.level?.toUpperCase()} RISK
                    </span>
                  </div>
                  {result.risk.factors?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-t border-border/50">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span className="text-foreground">{f.score}/100</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Demographics */}
              {result.demographics && (
                <Section title="Area Demographics" icon={<Users className="w-4 h-4" />} id="demo" expanded={expanded} toggle={toggle}>
                  {Object.entries(result.demographics).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* ESG */}
              {result.esg && (
                <Section title="ESG Score" icon={<Leaf className="w-4 h-4" />} id="esg" expanded={expanded} toggle={toggle}>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {["score", "environmental", "social", "governance"].map((k) => (
                      <div key={k} className="text-center p-2 rounded-lg bg-secondary/50">
                        <p className="text-lg font-bold text-foreground">{result.esg[k]}</p>
                        <p className="text-xs text-muted-foreground capitalize">{k === "score" ? "Overall" : k}</p>
                      </div>
                    ))}
                  </div>
                  {result.esg.notes && <p className="text-xs text-muted-foreground">{result.esg.notes}</p>}
                </Section>
              )}

              {/* Tips */}
              {result.tips && (
                <div className="rounded-xl bg-card border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Tips to Improve</h3>
                  <ul className="space-y-1.5">
                    {result.tips.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, id, expanded, toggle, children }: {
  title: string; icon: React.ReactNode; id: string;
  expanded: string | null; toggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">{icon} {title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function SwotBox({ label, items, icon }: { label: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3">
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">{icon} {label}</p>
      <ul className="space-y-1">
        {items?.map((item: string, i: number) => (
          <li key={i} className="text-xs text-muted-foreground">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
