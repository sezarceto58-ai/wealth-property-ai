import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileText, Table2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportReportProps {
  plan: any;
}

const copy = {
  en: { report: "Feasibility Report", area: "Area (m²)", shape: "Shape", generated: "Generated", landUse: "Land Use", recommendation: "Recommendation", confidence: "Confidence", rationale: "Rationale", financials: "Financials", totalCost: "Total Cost", projectedRevenue: "Projected Revenue", roi: "ROI %", payback: "Payback Years", breakeven: "Breakeven Units", design: "Design", parameter: "Parameter", value: "Value", floors: "Floors", unitsPerFloor: "Units/Floor", totalUnits: "Total Units", amenities: "Amenities", pdfOk: "PDF exported successfully", excelOk: "Excel exported successfully", exportFailed: "Export failed" },
  ar: { report: "تقرير الجدوى", area: "المساحة (م²)", shape: "الشكل", generated: "تاريخ الإنشاء", landUse: "استخدام الأرض", recommendation: "التوصية", confidence: "الثقة", rationale: "المبررات", financials: "البيانات المالية", totalCost: "إجمالي التكلفة", projectedRevenue: "الإيراد المتوقع", roi: "العائد %", payback: "سنوات الاسترداد", breakeven: "وحدات التعادل", design: "التصميم", parameter: "المعيار", value: "القيمة", floors: "الطوابق", unitsPerFloor: "الوحدات/الطابق", totalUnits: "إجمالي الوحدات", amenities: "الخدمات", pdfOk: "تم تصدير PDF بنجاح", excelOk: "تم تصدير Excel بنجاح", exportFailed: "فشل التصدير" },
  ku: { report: "ڕاپۆرتی کارایی", area: "بوار (م²)", shape: "شێوە", generated: "دروستکراو", landUse: "بەکارهێنانی زەوی", recommendation: "پێشنیار", confidence: "متمانە", rationale: "هۆکار", financials: "دارایی", totalCost: "کۆی تێچوو", projectedRevenue: "دەرامەتی چاوەڕوانکراو", roi: "ROI %", payback: "ساڵانی گەڕانەوەی پارە", breakeven: "یەکەکانی یەکسانبوون", design: "دیزاین", parameter: "پارامیتەر", value: "نرخ", floors: "نهۆمەکان", unitsPerFloor: "یەکە/نهۆم", totalUnits: "کۆی یەکەکان", amenities: "خزمەتگوزارییەکان", pdfOk: "PDF بە سەرکەوتوویی دەرچوو", excelOk: "Excel بە سەرکەوتوویی دەرچوو", exportFailed: "دەرخستن سەرکەوتوو نەبوو" },
} as const;

export default function ExportReport({ plan }: ExportReportProps) {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const lang = (i18n.language?.split("-")[0] ?? "en") as "en" | "ar" | "ku";
  const ui = useMemo(() => copy[lang] ?? copy.en, [lang]);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const r = plan.result || {};
      let y = 20;
      doc.setFontSize(18);
      doc.text(ui.report, 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(`${ui.area}: ${plan.land_area?.toLocaleString()} | ${ui.shape}: ${plan.shape || "—"} | ${ui.generated}: ${new Date(plan.created_at).toLocaleDateString()}`, 14, y);
      y += 12;
      if (r.land_use) {
        doc.setFontSize(14);
        doc.text(ui.landUse, 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`${ui.recommendation}: ${r.land_use.recommendation || "—"}`, 14, y);
        y += 6;
        doc.text(`${ui.confidence}: ${((r.land_use.confidence || 0) * 100).toFixed(0)}%`, 14, y);
        y += 6;
        const rationale = doc.splitTextToSize(r.land_use.rationale || "—", 180);
        doc.text(rationale, 14, y);
        y += rationale.length * 5 + 8;
      }
      if (r.financials) {
        doc.setFontSize(14);
        doc.text(ui.financials, 14, y);
        y += 8;
        autoTable(doc, { startY: y, head: [[ui.parameter, ui.value]], body: [[ui.totalCost, `$${r.financials.total_cost?.toLocaleString() || "—"}`], [ui.projectedRevenue, `$${r.financials.projected_revenue?.toLocaleString() || "—"}`], [ui.roi, `${r.financials.roi_pct?.toFixed(1) || "—"}%`], [ui.payback, `${r.financials.payback_years || "—"}`], [ui.breakeven, `${r.financials.breakeven_units || "—"}`]], theme: "grid", headStyles: { fillColor: [41, 37, 36] } });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      if (r.design) {
        doc.setFontSize(14);
        doc.text(ui.design, 14, y);
        y += 8;
        autoTable(doc, { startY: y, head: [[ui.parameter, ui.value]], body: [[ui.floors, String(r.design.floors || "—")], [ui.unitsPerFloor, String(r.design.units_per_floor || "—")], [ui.totalUnits, String((r.design.floors || 0) * (r.design.units_per_floor || 0))], [ui.amenities, (r.design.amenities || []).join(", ") || "—"]], theme: "grid", headStyles: { fillColor: [41, 37, 36] } });
      }
      doc.save(`feasibility-report-${plan.id?.slice(0, 8)}.pdf`);
      toast({ title: ui.pdfOk });
    } catch (err: any) {
      toast({ title: ui.exportFailed, description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = async () => {
    setExporting("excel");
    try {
      const XLSX = await import("xlsx");
      const r = plan.result || {};
      const wb = XLSX.utils.book_new();
      const summaryData = [[ui.report], [ui.area, plan.land_area], [ui.shape, plan.shape], [ui.generated, new Date(plan.created_at).toLocaleDateString()], [], [ui.landUse], [ui.recommendation, r.land_use?.recommendation], [ui.confidence, r.land_use?.confidence], [ui.rationale, r.land_use?.rationale], [], [ui.financials], [ui.totalCost, r.financials?.total_cost], [ui.projectedRevenue, r.financials?.projected_revenue], [ui.roi, r.financials?.roi_pct], [ui.payback, r.financials?.payback_years], [ui.breakeven, r.financials?.breakeven_units]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
      XLSX.writeFile(wb, `feasibility-report-${plan.id?.slice(0, 8)}.xlsx`);
      toast({ title: ui.excelOk });
    } catch (err: any) {
      toast({ title: ui.exportFailed, description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportPDF} disabled={!!exporting}>{exporting === "pdf" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}PDF</Button>
      <Button variant="outline" size="sm" onClick={exportExcel} disabled={!!exporting}>{exporting === "excel" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Table2 className="w-4 h-4 mr-1" />}Excel</Button>
    </div>
  );
}
