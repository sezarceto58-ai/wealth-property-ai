import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function CreateOpportunity() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", investment_type: "buy", property_type: "residential",
    city: "", address: "", country: "Iraq", entry_price: 0, currency: "USD",
    estimated_dev_cost: 0, expected_revenue: 0, land_area: 0, built_area: 0,
    bedrooms: 0, bathrooms: 0, floors: 1, timeline_months: 12,
    risk_level: "medium", zoning: "", legal_status: "", permit_status: "",
  });

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast.error(t("opportunities.titleRequired"));
      return;
    }
    setSaving(true);
    const { data, error } = await (supabase.from("opportunities" as any).insert({
      ...form,
      user_id: user.id,
      location: { lat: 0, lng: 0 },
    }).select("id").single() as any);

    if (error) {
      toast.error(t("opportunities.createError"));
      console.error(error);
    } else {
      toast.success(t("opportunities.createSuccess"));
      navigate(`/developer/opportunities/${data.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("opportunities.newOpportunity")}</h1>
          <p className="text-sm text-muted-foreground">{t("opportunities.createDesc")}</p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>{t("common.name")} *</Label>
            <Input placeholder="e.g. Baghdad Residential Tower" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("common.description")}</Label>
            <Textarea placeholder={t("opportunities.createDesc")} value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>

          <div>
            <Label>{t("opportunities.investmentType")}</Label>
            <Select value={form.investment_type} onValueChange={(v) => update("investment_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">{t("opportunities.typeBuyHold")}</SelectItem>
                <SelectItem value="develop">{t("opportunities.typeDevelop")}</SelectItem>
                <SelectItem value="flip">{t("opportunities.typeFlip")}</SelectItem>
                <SelectItem value="rent">{t("opportunities.typeRental")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("valuation.propertyType")}</Label>
            <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">{t("opportunities.propResidential")}</SelectItem>
                <SelectItem value="commercial">{t("opportunities.propCommercial")}</SelectItem>
                <SelectItem value="mixed_use">{t("opportunities.propMixedUse")}</SelectItem>
                <SelectItem value="land">{t("opportunities.propLand")}</SelectItem>
                <SelectItem value="industrial">{t("opportunities.propIndustrial")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("valuation.city")}</Label>
            <Input placeholder="Baghdad" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <Label>{t("opportunities.address")}</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>

          <div>
            <Label>{t("opportunities.entryPrice")}</Label>
            <Input type="number" value={form.entry_price} onChange={(e) => update("entry_price", +e.target.value)} />
          </div>
          <div>
            <Label>{t("opportunities.devCost")}</Label>
            <Input type="number" value={form.estimated_dev_cost} onChange={(e) => update("estimated_dev_cost", +e.target.value)} />
          </div>
          <div>
            <Label>{t("opportunities.expectedRevenue")}</Label>
            <Input type="number" value={form.expected_revenue} onChange={(e) => update("expected_revenue", +e.target.value)} />
          </div>
          <div>
            <Label>{t("opportunities.currency")}</Label>
            <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="IQD">IQD (Iraqi Dinar)</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("opportunities.landArea")}</Label>
            <Input type="number" value={form.land_area} onChange={(e) => update("land_area", +e.target.value)} />
          </div>
          <div>
            <Label>{t("valuation.builtArea")}</Label>
            <Input type="number" value={form.built_area} onChange={(e) => update("built_area", +e.target.value)} />
          </div>
          <div>
            <Label>{t("valuation.floors")}</Label>
            <Input type="number" value={form.floors} onChange={(e) => update("floors", +e.target.value)} />
          </div>
          <div>
            <Label>{t("opportunities.timeline")}</Label>
            <Input type="number" value={form.timeline_months} onChange={(e) => update("timeline_months", +e.target.value)} />
          </div>

          <div>
            <Label>{t("opportunities.riskLevel")}</Label>
            <Select value={form.risk_level} onValueChange={(v) => update("risk_level", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("opportunities.riskLow")}</SelectItem>
                <SelectItem value="medium">{t("opportunities.riskMedium")}</SelectItem>
                <SelectItem value="high">{t("opportunities.riskHigh")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("opportunities.zoning")}</Label>
            <Input value={form.zoning} onChange={(e) => update("zoning", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => navigate(-1)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-gold text-primary-foreground shadow-gold">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {t("opportunities.createAndAnalyze")}
          </Button>
        </div>
      </div>
    </div>
  );
}
