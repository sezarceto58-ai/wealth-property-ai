import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, ImagePlus, DollarSign, MapPin, Maximize, Tag, Brain, Loader2, Sparkles, TrendingUp, Shield, Users, Leaf, CheckCircle, XCircle, AlertTriangle, Target, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const propertyTypes = ["Apartment", "Villa", "Penthouse", "Commercial", "Land", "Townhouse"];
const cities = ["Erbil", "Baghdad", "Basra", "Sulaymaniyah", "Duhok", "Kirkuk"];
const featureOptions = [
"Swimming Pool", "Garden", "Smart Home", "Security System", "Garage",
"Balcony", "Parking", "Gym Access", "24/7 Security", "Elevator",
"Conference Room", "Fiber Internet", "Terrace", "Premium Finishes",
"Private Elevator", "360° Virtual Tour"];


type TabKey = "manual" | "ai";

export default function CreateProperty() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "en";
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("manual");
  const [publishing, setPublishing] = useState(false);

  // Manual form state
  const [form, setForm] = useState({
    title: "", titleAr: "", price: "", currency: "USD" as "USD" | "IQD",
    type: "sale" as "sale" | "rent", propertyType: "Apartment", city: "Erbil",
    district: "", bedrooms: "3", bathrooms: "2", area: "", description: "",
    features: [] as string[]
  });

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleFeature = (f: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f]
    }));
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const saveToSupabase = async (status: "active" | "draft") => {
    if (!form.title.trim() || !form.price || !form.district.trim() || !form.area) {
      toast({ title: t("common.error"), description: t("landForm.fillRequired"), variant: "destructive" });
      return false;
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast({ title: "Invalid price", description: "Please enter a valid price.", variant: "destructive" });
      return false;
    }
    if (isNaN(Number(form.area)) || Number(form.area) <= 0) {
      toast({ title: "Invalid area", description: "Please enter a valid area in m².", variant: "destructive" });
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in again.", variant: "destructive" });
      return false;
    }

    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      title_ar: form.titleAr.trim() || null,
      description: form.description.trim() || null,
      price: Number(form.price),
      currency: form.currency,
      type: form.type,
      property_type: form.propertyType,
      city: form.city,
      district: form.district.trim(),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area),
      features: form.features,
      status,
      terra_score: 70,   // default — recalculated server-side later
      verified: false,
    };

    const { error } = await supabase.from("properties").insert(payload as any);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    // Invalidate listing caches
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["my-properties"] });
    return true;
  };

  const handlePublish = async () => {
    setPublishing(true);
    const ok = await saveToSupabase("active");
    setPublishing(false);
    if (ok) {
      toast({ title: t("createProperty.publishSuccess") });
      setTimeout(() => navigate("/seller/listings"), 1200);
    }
  };

  const handleSaveDraft = async () => {
    setPublishing(true);
    const ok = await saveToSupabase("draft");
    setPublishing(false);
    if (ok) {
      toast({ title: t("createProperty.draftSaved") });
    }
  };

  const handleAIGenerate = async () => {
    if (!form.district || !form.area) {
      toast({ title: "Missing info", description: "Please fill in district and area first.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-analysis", {
        body: {
          type: "listing_assist",
          language: lang,
          property: {
            type: form.propertyType, city: form.city, district: form.district,
            bedrooms: parseInt(form.bedrooms) || 0, bathrooms: parseInt(form.bathrooms) || 0,
            area: parseInt(form.area) || 0, features: form.features,
            condition: "new", askingPrice: parseInt(form.price) || undefined
          }
        }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
      } else {
        setAiResult(data.analysis);
        setActiveTab("ai");
        toast({ title: t("aiAnalysisResult.analysisComplete"), description: t("aiAnalysisResult.analysisReady") });
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIToForm = () => {
    if (!aiResult?.listing) return;
    setForm((prev) => ({
      ...prev,
      title: aiResult.listing.title || prev.title,
      titleAr: aiResult.listing.titleAr || prev.titleAr,
      description: aiResult.listing.description || prev.description
    }));
    setActiveTab("manual");
    toast({ title: "Applied!", description: "AI-generated content applied to your listing form." });
  };

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("createProperty.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("createProperty.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-card border border-border">
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === "manual" ?
          "bg-primary text-primary-foreground shadow-sm" :
          "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`
          }>

          <Building2 className="w-4 h-4" /> {t("createProperty.tabManual")}
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === "ai" ?
          "bg-primary text-primary-foreground shadow-sm" :
          "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`
          }>

          <Brain className="w-4 h-4" /> {t("createProperty.tabAI")}
        </button>
      </div>

      {/* AI Generate Button (always visible) */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{t("createProperty.aiPoweredBanner")}</p>
            <p className="text-xs text-muted-foreground">{t("createProperty.aiPoweredBannerDesc")}</p>
          </div>
        </div>
        <Button onClick={handleAIGenerate} disabled={aiLoading} size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90 border-0">
          {aiLoading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t("createProperty.generating")}</> : <><Brain className="w-4 h-4 mr-1" /> {t("createProperty.generate")}</>}
        </Button>
      </div>

      {activeTab === "manual" ?
      <ManualForm
        form={form} update={update} toggleFeature={toggleFeature}
        handlePublish={handlePublish} handleSaveDraft={handleSaveDraft} toast={toast} publishing={publishing} /> :


      <AIResultsPanel result={aiResult} loading={aiLoading} expanded={expanded} toggle={toggle} applyAIToForm={applyAIToForm} />
      }
    </div>);

}

/* ─── Manual Form ─── */
function ManualForm({ form, update, toggleFeature, handlePublish, handleSaveDraft, toast, publishing }: any) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      {/* Images */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 bg-muted">
          <ImagePlus className="w-4 h-4 text-primary" /> {t("createProperty.images")}
        </h2>
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => toast({ title: "Upload ready", description: "Image upload will be available with storage integration." })}>

          <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop images or click to browse</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Max 10 images, 5MB each</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> {t("createProperty.basicInfo")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.titleEn")}</label>
            <input value={form.title} onChange={(e: any) => update("title", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border" placeholder="Modern Apartment - Erbil" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.titleAr")}</label>
            <input value={form.titleAr} onChange={(e: any) => update("titleAr", e.target.value)} placeholder="شقة حديثة - أربيل" dir="rtl" className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.propertyType")}</label>
            <select value={form.propertyType} onChange={(e: any) => update("propertyType", e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-border bg-[#a6d6ed]">
              {propertyTypes.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.listingType")}</label>
            <div className="flex gap-2">
              <button onClick={() => update("type", "sale")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${form.type === "sale" ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>{t("createProperty.selectForSale")}</button>
              <button onClick={() => update("type", "rent")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${form.type === "rent" ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>{t("createProperty.selectForRent")}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> {t("createProperty.locationSection")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.city")}</label>
            <select value={form.city} onChange={(e: any) => update("city", e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-border bg-[#a6d6ed]">
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.district")}</label>
            <input value={form.district} onChange={(e: any) => update("district", e.target.value)} placeholder={t("createProperty.districtPlaceholder")} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> {t("createProperty.pricingSection")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.price")}</label>
            <input type="number" value={form.price} onChange={(e: any) => update("price", e.target.value)} placeholder="320000" className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.currency")}</label>
            <div className="flex gap-2">
              {(["USD", "IQD"] as const).map((c) =>
              <button key={c} onClick={() => update("currency", c)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${form.currency === c ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>{c}</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Maximize className="w-4 h-4 text-primary" /> {t("createProperty.specifications")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.bedrooms")}</label>
            <input type="number" value={form.bedrooms} onChange={(e: any) => update("bedrooms", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.bathrooms")}</label>
            <input type="number" value={form.bathrooms} onChange={(e: any) => update("bathrooms", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("createProperty.area")}</label>
            <input type="number" value={form.area} onChange={(e: any) => update("area", e.target.value)} placeholder="450" className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> {t("createProperty.descriptionSection")}
        </h2>
        <textarea value={form.description} onChange={(e: any) => update("description", e.target.value)} rows={4} placeholder={t("createProperty.descriptionPlaceholder")} className="w-full px-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border resize-none" />
      </div>

      {/* Features */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> {t("createProperty.featuresSection")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {featureOptions.map((f) =>
          <button key={f} onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.features.includes(f) ? "bg-primary/10 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>{f}</button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex-1 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("createProperty.publishing")}</> : t("createProperty.publish")}
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={publishing}
          className="px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t("createProperty.saveDraft")}
        </button>
      </div>
    </div>);

}

/* ─── AI Results Panel ─── */
function AIResultsPanel({ result, loading, expanded, toggle, applyAIToForm }: any) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="rounded-xl bg-card border border-border p-16 text-center">
        <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">{t("aiAnalysisResult.analyzingMarket")}</p>
      </div>);

  }

  if (!result) {
    return (
      <div className="rounded-xl bg-card border border-border p-16 text-center">
        <Brain className="w-14 h-14 mx-auto text-muted-foreground/20 mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{t("aiAnalysisResult.readyTitle")}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto" dir="auto">
          {t("createProperty.noAiYet")}
        </p>
      </div>);

  }

  return (
    <div className="space-y-4">
      {/* Apply to form banner */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">AI content ready</p>
          <p className="text-xs text-muted-foreground">Apply the generated title & description to your listing form</p>
        </div>
        <Button onClick={applyAIToForm} size="sm" variant="default">
          <Sparkles className="w-4 h-4 mr-1" /> Apply to Form
        </Button>
      </div>

      {/* Generated Listing */}
      {result.listing &&
      <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {t("createProperty.generatedListing")}</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("createProperty.aiTitleLabel")}</p>
              <p className="text-lg font-bold text-foreground" dir="auto">{result.listing.title}</p>
              {result.listing.titleAr && <p className="text-sm text-muted-foreground mt-0.5 text-right" dir="rtl">{result.listing.titleAr}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("createProperty.aiDescription")}</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line" dir="auto">{result.listing.description}</p>
            </div>
            {result.listing.highlights &&
          <div>
                <p className="text-xs text-muted-foreground mb-1">{t("createProperty.keyHighlights")}</p>
                <div className="flex flex-wrap gap-2">
                  {result.listing.highlights.map((h: string, i: number) =>
              <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium" dir="auto">{h}</span>
              )}
                </div>
              </div>
          }
            {result.listing.targetBuyer &&
          <div>
                <p className="text-xs text-muted-foreground">{t("createProperty.targetBuyer")}</p>
                <p className="text-sm text-foreground" dir="auto">{result.listing.targetBuyer}</p>
              </div>
          }
          </div>
        </div>
      }

      {/* Pricing */}
      {result.pricing &&
      <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-warning" /> {t("createProperty.priceRecommendation")}</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">{t("aiAnalysisResult.recommended")}</p>
              <p className="text-xl font-bold text-primary">${result.pricing.recommendedPrice?.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">{t("aiAnalysisResult.range")}</p>
              <p className="text-sm font-medium text-foreground">${result.pricing.priceRange?.min?.toLocaleString()} - ${result.pricing.priceRange?.max?.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">$/m²</p>
              <p className="text-xl font-bold text-foreground">${result.pricing.pricePerSqm?.toLocaleString()}</p>
            </div>
          </div>
          {result.pricing.reasoning && <p className="text-sm text-muted-foreground" dir="auto">{result.pricing.reasoning}</p>}
        </div>
      }

      {/* Expandable sections */}
      {result.marketTrends &&
      <Section title={t("createProperty.marketTrends")} icon={<TrendingUp className="w-4 h-4 text-info" />} id="trends" expanded={expanded} toggle={toggle}>
          {Object.entries(result.marketTrends).map(([k, v]) =>
        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="font-medium text-foreground" dir="auto">{String(v)}</span>
            </div>
        )}
        </Section>
      }

      {result.swot &&
      <Section title={t("createProperty.swot")} icon={<BarChart3 className="w-4 h-4 text-primary" />} id="swot" expanded={expanded} toggle={toggle}>
          <div className="grid grid-cols-2 gap-3">
            <SwotBox label={t("createProperty.strengths")} items={result.swot.strengths} color="text-[hsl(var(--success))]" icon={<CheckCircle className="w-3.5 h-3.5" />} />
            <SwotBox label={t("createProperty.weaknesses")} items={result.swot.weaknesses} color="text-destructive" icon={<XCircle className="w-3.5 h-3.5" />} />
            <SwotBox label={t("createProperty.opportunities")} items={result.swot.opportunities} color="text-info" icon={<TrendingUp className="w-3.5 h-3.5" />} />
            <SwotBox label={t("createProperty.threats")} items={result.swot.threats} color="text-warning" icon={<AlertTriangle className="w-3.5 h-3.5" />} />
          </div>
        </Section>
      }

      {result.investmentScore &&
      <Section title={t("createProperty.investmentScore")} icon={<Target className="w-4 h-4 text-warning" />} id="score" expanded={expanded} toggle={toggle}>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(result.investmentScore).map(([k, v]) =>
          <div key={k} className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold text-primary">{v as number}</p>
                <p className="text-xs text-muted-foreground capitalize">{k}</p>
              </div>
          )}
          </div>
        </Section>
      }

      {result.financials &&
      <Section title={t("createProperty.financialMetrics")} icon={<DollarSign className="w-4 h-4 text-[hsl(var(--success))]" />} id="fin" expanded={expanded} toggle={toggle}>
          {Object.entries(result.financials).map(([k, v]) =>
        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="font-medium text-foreground" dir="auto">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
            </div>
        )}
        </Section>
      }

      {result.risk &&
      <Section title={t("createProperty.riskAssessment")} icon={<Shield className="w-4 h-4 text-destructive" />} id="risk" expanded={expanded} toggle={toggle}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-foreground">{result.risk.overallScore}/100</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${result.risk.level === "low" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : result.risk.level === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
              {result.risk.level?.toUpperCase()} RISK
            </span>
          </div>
          {result.risk.factors?.map((f: any, i: number) =>
        <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground" dir="auto">{f.name}</span>
              <span className="text-foreground font-medium">{f.score}/100</span>
            </div>
        )}
        </Section>
      }

      {result.demographics &&
      <Section title={t("createProperty.areaDemographics")} icon={<Users className="w-4 h-4 text-info" />} id="demo" expanded={expanded} toggle={toggle}>
          {Object.entries(result.demographics).map(([k, v]) =>
        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="font-medium text-foreground" dir="auto">{String(v)}</span>
            </div>
        )}
        </Section>
      }

      {result.esg &&
      <Section title={t("createProperty.esgScore")} icon={<Leaf className="w-4 h-4 text-[hsl(var(--success))]" />} id="esg" expanded={expanded} toggle={toggle}>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {["score", "environmental", "social", "governance"].map((k) =>
          <div key={k} className="text-center p-2 rounded-lg bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/10">
                <p className="text-lg font-bold text-[hsl(var(--success))]">{result.esg[k]}</p>
                <p className="text-xs text-muted-foreground capitalize">{k === "score" ? "Overall" : k}</p>
              </div>
          )}
          </div>
          {result.esg.notes && <p className="text-xs text-muted-foreground" dir="auto">{result.esg.notes}</p>}
        </Section>
      }

      {result.tips &&
      <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-warning" /> {t("createProperty.tipsToImprove")}</h3>
          <ul className="space-y-1.5">
            {result.tips.map((tip: string, i: number) =>
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2" dir="auto">
                <span className="text-warning font-bold">{i + 1}.</span> {tip}
              </li>
          )}
          </ul>
        </div>
      }
    </div>);

}

/* ─── Shared Components ─── */
function Section({ title, icon, id, expanded, toggle, children


}: {title: string;icon: React.ReactNode;id: string;expanded: string | null;toggle: (id: string) => void;children: React.ReactNode;}) {
  const isOpen = expanded === id;
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">{icon} {title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>);

}

function SwotBox({ label, items, icon, color }: {label: string;items: string[];icon: React.ReactNode;color: string;}) {
  return (
    <div className="rounded-lg bg-secondary/20 p-3">
      <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${color}`}>{icon} {label}</p>
      <ul className="space-y-1">
        {items?.map((item: string, i: number) =>
        <li key={i} className="text-xs text-muted-foreground" dir="auto">• {item}</li>
        )}
      </ul>
    </div>);

}
