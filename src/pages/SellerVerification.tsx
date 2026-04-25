import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Upload, FileText, CheckCircle2, Clock, XCircle, Loader2, Trash2 } from "lucide-react";

type Verification = {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  document_url: string | null;
  storage_path: string | null;
  notes: string | null;
  created_at: string;
};

type PropertyDoc = {
  id: string;
  property_id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  url: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; labelKey: string }> = {
  pending: { icon: Clock, color: "text-warning", labelKey: "sellerVerification.statusPending" },
  approved: { icon: CheckCircle2, color: "text-success", labelKey: "sellerVerification.statusApproved" },
  rejected: { icon: XCircle, color: "text-destructive", labelKey: "sellerVerification.statusRejected" },
};

export default function SellerVerification() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("id_card");
  const [propDocType, setPropDocType] = useState("deed");
  const [selectedProperty, setSelectedProperty] = useState("");

  // Fetch verifications
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ["seller-verifications"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("seller_verifications" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return (data ?? []) as Verification[];
    },
  });

  // Fetch user properties for document uploads
  const { data: properties = [] } = useQuery({
    queryKey: ["my-properties-for-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title")
        .eq("user_id", user?.id ?? "");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch property documents
  const { data: propertyDocs = [] } = useQuery({
    queryKey: ["property-documents"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("property_documents" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return (data ?? []) as PropertyDoc[];
    },
  });

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("sellerVerification.fileTooLarge5mb"));
      return;
    }

    setUploading(true);
    const path = `${user.id}/id/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("seller-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error(t("sellerVerification.uploadFailed", { message: uploadError.message }));
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("seller-documents")
      .getPublicUrl(path);

    const { error: insertError } = await (supabase
      .from("seller_verifications" as any)
      .insert({
        user_id: user.id,
        verification_type: docType,
        storage_path: path,
        document_url: urlData.publicUrl,
      }) as any);

    if (insertError) {
      toast.error(t("sellerVerification.saveFailed"));
    } else {
      toast.success(t("sellerVerification.idSubmitted"));
      qc.invalidateQueries({ queryKey: ["seller-verifications"] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handlePropertyDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedProperty) {
      toast.error(t("sellerVerification.selectPropertyFirst"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("sellerVerification.fileTooLarge10mb"));
      return;
    }

    setUploading(true);
    const path = `${user.id}/property/${selectedProperty}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("seller-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error(t("sellerVerification.uploadFailed", { message: uploadError.message }));
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("seller-documents")
      .getPublicUrl(path);

    const { error: insertError } = await (supabase
      .from("property_documents" as any)
      .insert({
        property_id: selectedProperty,
        user_id: user.id,
        document_type: propDocType,
        file_name: file.name,
        storage_path: path,
        url: urlData.publicUrl,
      }) as any);

    if (insertError) {
      toast.error(t("sellerVerification.saveDocFailed"));
    } else {
      toast.success(t("sellerVerification.propDocUploaded"));
      qc.invalidateQueries({ queryKey: ["property-documents"] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const deleteDoc = async (doc: PropertyDoc) => {
    await supabase.storage.from("seller-documents").remove([doc.storage_path]);
    await (supabase.from("property_documents" as any).delete().eq("id", doc.id) as any);
    qc.invalidateQueries({ queryKey: ["property-documents"] });
    toast.success(t("sellerVerification.docDeleted"));
  };

  const latestVerification = verifications[0];
  const statusInfo = latestVerification ? STATUS_CONFIG[latestVerification.status] ?? STATUS_CONFIG.pending : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> {t("sellerVerification.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("sellerVerification.subtitle")}
        </p>
      </div>

      {/* ID Verification Section */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("sellerVerification.identityTitle")}</h2>
          {statusInfo && (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${statusInfo.color}`}>
              <statusInfo.icon className="w-4 h-4" />
              {t(statusInfo.labelKey)}
            </span>
          )}
        </div>

        {latestVerification?.status === "approved" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-sm text-foreground">{t("sellerVerification.identityApproved")}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("sellerVerification.identityDesc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t("sellerVerification.docType")}</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id_card">{t("sellerVerification.nationalId")}</SelectItem>
                    <SelectItem value="passport">{t("sellerVerification.passport")}</SelectItem>
                    <SelectItem value="drivers_license">{t("sellerVerification.driversLicense")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("sellerVerification.uploadDoc")}</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> {t("sellerVerification.uploading")}
              </div>
            )}
          </>
        )}

        {verifications.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">{t("sellerVerification.submissionHistory")}</p>
            {verifications.map((v) => {
              const s = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={v.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground capitalize">{v.verification_type.replace("_", " ")}</span>
                  <span className={`flex items-center gap-1 ${s.color}`}>
                    <s.icon className="w-3.5 h-3.5" /> {t(s.labelKey)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Property Documents Section */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> {t("sellerVerification.propDocsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("sellerVerification.propDocsDesc")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>{t("sellerVerification.property")}</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger><SelectValue placeholder={t("sellerVerification.selectProperty")} /></SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("sellerVerification.docType")}</Label>
            <Select value={propDocType} onValueChange={setPropDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deed">{t("sellerVerification.titleDeed")}</SelectItem>
                <SelectItem value="permit">{t("sellerVerification.buildingPermit")}</SelectItem>
                <SelectItem value="survey">{t("sellerVerification.landSurvey")}</SelectItem>
                <SelectItem value="legal">{t("sellerVerification.legalDoc")}</SelectItem>
                <SelectItem value="other">{t("sellerVerification.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("sellerVerification.uploadFile")}</Label>
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handlePropertyDocUpload}
              disabled={uploading || !selectedProperty}
              className="cursor-pointer"
            />
          </div>
        </div>

        {propertyDocs.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">{t("sellerVerification.uploadedDocs")}</p>
            {propertyDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.document_type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {properties.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("sellerVerification.noPropertiesHint")}
          </p>
        )}
      </section>
    </div>
  );
}
