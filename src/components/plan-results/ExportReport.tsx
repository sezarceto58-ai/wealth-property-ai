import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportReportProps {
  plan: any;
}

export default function ExportReport({ plan }: ExportReportProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const r = plan.result || {};
      let y = 20;

      doc.setFontSize(18);
      doc.text("Feasibility Report", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(`Area: ${plan.land_area?.toLocaleString()} m² | Shape: ${plan.shape || "—"} | Generated: ${new Date(plan.created_at).toLocaleDateString()}`, 14, y);
      y += 12;

      // Land Use
      if (r.land_use) {
        doc.setFontSize(14);
        doc.text("Land Use Recommendation", 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Recommendation: ${r.land_use.recommendation || "—"}`, 14, y);
        y += 6;
        doc.text(`Confidence: ${((r.land_use.confidence || 0) * 100).toFixed(0)}%`, 14, y);
        y += 6;
        const rationale = doc.splitTextToSize(r.land_use.rationale || "—", 180);
        doc.text(rationale, 14, y);
        y += rationale.length * 5 + 8;
      }

      // Financials
      if (r.financials) {
        doc.setFontSize(14);
        doc.text("Financial Summary", 14, y);
        y += 8;
        autoTable(doc, {
          startY: y,
          head: [["Metric", "Value"]],
          body: [
            ["Total Cost", `$${r.financials.total_cost?.toLocaleString() || "—"}`],
            ["Projected Revenue", `$${r.financials.projected_revenue?.toLocaleString() || "—"}`],
            ["ROI", `${r.financials.roi_pct?.toFixed(1) || "—"}%`],
            ["Payback Years", `${r.financials.payback_years || "—"}`],
            ["Breakeven Units", `${r.financials.breakeven_units || "—"}`],
          ],
          theme: "grid",
          headStyles: { fillColor: [41, 37, 36] },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Design
      if (r.design) {
        doc.setFontSize(14);
        doc.text("Design Overview", 14, y);
        y += 8;
        autoTable(doc, {
          startY: y,
          head: [["Parameter", "Value"]],
          body: [
            ["Floors", String(r.design.floors || "—")],
            ["Units / Floor", String(r.design.units_per_floor || "—")],
            ["Total Units", String((r.design.floors || 0) * (r.design.units_per_floor || 0))],
            ["Amenities", (r.design.amenities || []).join(", ") || "—"],
          ],
          theme: "grid",
          headStyles: { fillColor: [41, 37, 36] },
        });
      }

      doc.save(`feasibility-report-${plan.id?.slice(0, 8)}.pdf`);
      toast({ title: "PDF exported successfully" });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
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

      // Summary sheet
      const summaryData = [
        ["Feasibility Report"],
        ["Area (m²)", plan.land_area],
        ["Shape", plan.shape],
        ["Generated", new Date(plan.created_at).toLocaleDateString()],
        [],
        ["Land Use"],
        ["Recommendation", r.land_use?.recommendation],
        ["Confidence", r.land_use?.confidence],
        ["Rationale", r.land_use?.rationale],
        [],
        ["Financials"],
        ["Total Cost", r.financials?.total_cost],
        ["Projected Revenue", r.financials?.projected_revenue],
        ["ROI %", r.financials?.roi_pct],
        ["Payback Years", r.financials?.payback_years],
        ["Breakeven Units", r.financials?.breakeven_units],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Summary");

      // Pricing by floor
      if (r.pricing?.by_floor?.length) {
        const floorData = [["Floor", "Premium %", "Price/m²"], ...r.pricing.by_floor.map((f: any) => [f.floor, f.premium_pct, f.price_per_sqm])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(floorData), "Floor Pricing");
      }

      // Pricing by unit
      if (r.pricing?.by_unit_type?.length) {
        const unitData = [["Type", "Area m²", "Area ft²", "$/m²", "$/ft²", "Unit Price"], ...r.pricing.by_unit_type.map((u: any) => [u.type, u.area_sqm, u.area_sqft, u.price_per_sqm, u.price_per_sqft, u.price_per_unit])];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(unitData), "Unit Pricing");
      }

      // Design
      if (r.design) {
        const designData = [
          ["Parameter", "Value"],
          ["Floors", r.design.floors],
          ["Units/Floor", r.design.units_per_floor],
          ["Total Units", (r.design.floors || 0) * (r.design.units_per_floor || 0)],
          ["Amenities", (r.design.amenities || []).join(", ")],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(designData), "Design");
      }

      XLSX.writeFile(wb, `feasibility-report-${plan.id?.slice(0, 8)}.xlsx`);
      toast({ title: "Excel exported successfully" });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportPDF} disabled={!!exporting}>
        {exporting === "pdf" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={exportExcel} disabled={!!exporting}>
        {exporting === "excel" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Table2 className="w-4 h-4 mr-1" />}
        Excel
      </Button>
    </div>
  );
}
