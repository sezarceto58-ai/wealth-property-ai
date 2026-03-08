import { useState } from "react";
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

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending Review" },
  approved: { icon: CheckCircle2, color: "text-success", label: "Approved" },
  rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
};

export default function SellerVerification() {
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
      toast.error("File must be under 5MB");
      return;
    }

    setUploading(true);
    const path = `${user.id}/id/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("seller-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
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
      toast.error("Failed to save verification record");
    } else {
      toast.success("ID document submitted for verification!");
      qc.invalidateQueries({ queryKey: ["seller-verifications"] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handlePropertyDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedProperty) {
      toast.error("Select a property first");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setUploading(true);
    const path = `${user.id}/property/${selectedProperty}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("seller-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
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
      toast.error("Failed to save document record");
    } else {
      toast.success("Property document uploaded!");
      qc.invalidateQueries({ queryKey: ["property-documents"] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const deleteDoc = async (doc: PropertyDoc) => {
    await supabase.storage.from("seller-documents").remove([doc.storage_path]);
    await (supabase.from("property_documents" as any).delete().eq("id", doc.id) as any);
    qc.invalidateQueries({ queryKey: ["property-documents"] });
    toast.success("Document deleted");
  };

  const latestVerification = verifications[0];
  const statusInfo = latestVerification ? STATUS_CONFIG[latestVerification.status] ?? STATUS_CONFIG.pending : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Seller Verification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify your identity and upload property documents for trust & compliance
        </p>
      </div>

      {/* ID Verification Section */}
      <section className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Identity Verification</h2>
          {statusInfo && (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${statusInfo.color}`}>
              <statusInfo.icon className="w-4 h-4" />
              {statusInfo.label}
            </span>
          )}
        </div>

        {latestVerification?.status === "approved" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-sm text-foreground">Your identity has been verified. You're a trusted seller!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Upload a government-issued ID (passport, national ID, or driver's license) to become a verified seller.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id_card">National ID Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Upload Document</Label>
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
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </div>
            )}
          </>
        )}

        {verifications.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">Submission History</p>
            {verifications.map((v) => {
              const s = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={v.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground capitalize">{v.verification_type.replace("_", " ")}</span>
                  <span className={`flex items-center gap-1 ${s.color}`}>
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
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
          <FileText className="w-5 h-5 text-primary" /> Property Documents
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload deeds, permits, and legal documents for your properties.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Property</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Document Type</Label>
            <Select value={propDocType} onValueChange={setPropDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deed">Title Deed</SelectItem>
                <SelectItem value="permit">Building Permit</SelectItem>
                <SelectItem value="survey">Land Survey</SelectItem>
                <SelectItem value="legal">Legal Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Upload File</Label>
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
            <p className="text-xs font-medium text-muted-foreground uppercase">Uploaded Documents</p>
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
            Create a listing first to upload property documents.
          </p>
        )}
      </section>
    </div>
  );
}
