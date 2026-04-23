import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, MapPin, Building2, DollarSign, Megaphone, TrendingUp,
  CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import LandUseTab from "@/components/plan-results/LandUseTab";
import DesignTab from "@/components/plan-results/DesignTab";
import PricingTab from "@/components/plan-results/PricingTab";
import MarketingTab from "@/components/plan-results/MarketingTab";
import FeasibilityTab from "@/components/plan-results/FeasibilityTab";
import ExportReport from "@/components/plan-results/ExportReport";

type Plan = {
  id: string;
  land_area: number;
  land_location: { lat: number; lng: number };
  shape: string;
  max_floors: number;
  restrictions: string[];
  status: string;
  result: any;
  created_at: string;
};

const copy = {
  en: {
    notFound: "Plan not found",
    backToDashboard: "Back to Dashboard",
    reportTitle: "Feasibility Report",
    analyzingTitle: "AI is analyzing your land…",
    analyzingDesc: "This usually takes 30–60 seconds. The page will update automatically.",
    analysisFailed: "Analysis failed. Please try again or adjust your inputs.",
    pricingUpdated: "Pricing updated",
    tabs: { use: "Use", design: "Design", pricing: "Pricing", marketing: "Marketing", feasibility: "Feasibility" },
    statuses: { processing: "Processing", complete: "Complete", error: "Error" },
  },
  ar: {
    notFound: "لم يتم العثور على الخطة",
    backToDashboard: "العودة إلى لوحة التحكم",
    reportTitle: "تقرير الجدوى",
    analyzingTitle: "يقوم الذكاء الاصطناعي بتحليل أرضك…",
    analyzingDesc: "يستغرق هذا عادةً من 30 إلى 60 ثانية. سيتم تحديث الصفحة تلقائياً.",
    analysisFailed: "فشل التحليل. يرجى المحاولة مرة أخرى أو تعديل المدخلات.",
    pricingUpdated: "تم تحديث التسعير",
    tabs: { use: "الاستخدام", design: "التصميم", pricing: "التسعير", marketing: "التسويق", feasibility: "الجدوى" },
    statuses: { processing: "قيد المعالجة", complete: "مكتمل", error: "خطأ" },
  },
  ku: {
    notFound: "پلانەکە نەدۆزرایەوە",
    backToDashboard: "گەڕانەوە بۆ داشبۆرد",
    reportTitle: "ڕاپۆرتی کارایی",
    analyzingTitle: "زیرەکی دەستکرد خەریکی شیکردنەوەی زەوییەکەتە…",
    analyzingDesc: "بە زۆری 30 بۆ 60 چرکە دەخایەنێت. پەڕەکە خۆکارانە نوێ دەبێتەوە.",
    analysisFailed: "شیکردنەوەکە سەرکەوتوو نەبوو. تکایە دووبارە هەوڵبدەوە یان زانیارییەکان بگۆڕە.",
    pricingUpdated: "نرخەکان نوێکرانەوە",
    tabs: { use: "بەکارهێنان", design: "دیزاین", pricing: "نرخ", marketing: "مارکێتینگ", feasibility: "کارایی" },
    statuses: { processing: "لە پرۆسەسەدایە", complete: "تەواوبوو", error: "هەڵە" },
  },
} as const;

const shapeLabels: Record<string, Record<string, string>> = {
  rectangle: { en: "Rectangle", ar: "مستطيل", ku: "گۆشەدار" },
  square: { en: "Square", ar: "مربع", ku: "چوارگۆشە" },
  irregular: { en: "Irregular", ar: "غير منتظم", ku: "ناریگولەر" },
};

export default function PlanResults() {
  const { i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);

  const fetchPlan = async () => {
    if (!id) return;
    const { data, error } = await (supabase
      .from("project_plans" as any)
      .select("*")
      .eq("id", id)
      .single() as any);
    if (error) {
      toast({ title: ui.notFound, description: ui.notFound, variant: "destructive" });
    } else {
      setPlan(data as Plan);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlan();
    const interval = setInterval(async () => {
      if (plan?.status === "processing") {
        const { data } = await (supabase
          .from("project_plans" as any)
          .select("status, result")
          .eq("id", id)
          .single() as any);
        if (data && data.status !== "processing") {
          setPlan((prev) => prev ? { ...prev, ...data } : prev);
          clearInterval(interval);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, plan?.status]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-medium">{ui.notFound}</p>
        <Link to="/developer"><Button variant="outline" className="mt-4">{ui.backToDashboard}</Button></Link>
      </div>
    );
  }

  if (plan.status === "processing") {
    return (
      <div className="text-center py-16 space-y-4">
        <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
        <p className="text-foreground font-medium text-lg">{ui.analyzingTitle}</p>
        <p className="text-sm text-muted-foreground">{ui.analyzingDesc}</p>
      </div>
    );
  }

  const r = plan.result || {};
  const lat = plan.land_location?.lat || 0;
  const lng = plan.land_location?.lng || 0;
  const localizedShape = shapeLabels[plan.shape]?.[lang] ?? plan.shape;
  const statusLabel = ui.statuses[plan.status as keyof typeof ui.statuses] ?? plan.status;

  const handlePricingUpdate = async (updatedPricing: any) => {
    const newResult = { ...r, pricing: updatedPricing };
    setPlan((prev) => prev ? { ...prev, result: newResult } : prev);
    await supabase.functions.invoke("planner-plans", {
      body: { result: { pricing: updatedPricing } },
      method: "PUT",
    }).catch(() => {});
    await (supabase.from("project_plans" as any).update({ result: newResult } as any).eq("id", id) as any);
    toast({ title: ui.pricingUpdated });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/developer">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-foreground">{ui.reportTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {plan.land_area.toLocaleString()} m² · {localizedShape} · {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plan.status === "complete" && <ExportReport plan={plan} />}
          <Badge variant={plan.status === "complete" ? "default" : "destructive"} className="flex items-center gap-1">
            {plan.status === "complete" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {statusLabel}
          </Badge>
        </div>
      </div>

      {plan.status === "error" && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {ui.analysisFailed}
        </div>
      )}

      {plan.status === "complete" && r && (
        <Tabs defaultValue="use" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="use" className="text-xs"><MapPin className="w-3 h-3 mr-1" /> {ui.tabs.use}</TabsTrigger>
            <TabsTrigger value="design" className="text-xs"><Building2 className="w-3 h-3 mr-1" /> {ui.tabs.design}</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs"><DollarSign className="w-3 h-3 mr-1" /> {ui.tabs.pricing}</TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs"><Megaphone className="w-3 h-3 mr-1" /> {ui.tabs.marketing}</TabsTrigger>
            <TabsTrigger value="feasibility" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" /> {ui.tabs.feasibility}</TabsTrigger>
          </TabsList>

          <TabsContent value="use" className="mt-4"><LandUseTab r={r} lat={lat} lng={lng} /></TabsContent>
          <TabsContent value="design" className="mt-4"><DesignTab r={r} /></TabsContent>
          <TabsContent value="pricing" className="mt-4"><PricingTab r={r} onPricingUpdate={handlePricingUpdate} /></TabsContent>
          <TabsContent value="marketing" className="mt-4"><MarketingTab r={r} /></TabsContent>
          <TabsContent value="feasibility" className="mt-4"><FeasibilityTab r={r} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
