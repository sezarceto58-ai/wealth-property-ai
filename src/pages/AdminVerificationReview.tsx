import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, FileCheck, ExternalLink, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Verification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  document_url: string | null;
  storage_path: string | null;
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const statusConfig: Record<string, { icon: any; class: string; label: string }> = {
  pending: { icon: Clock, class: "bg-warning/10 text-warning", label: "Pending" },
  approved: { icon: CheckCircle, class: "bg-success/10 text-success", label: "Approved" },
  rejected: { icon: XCircle, class: "bg-destructive/10 text-destructive", label: "Rejected" },
};

export default function AdminVerificationReview() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVerifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seller_verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading verifications", description: error.message, variant: "destructive" });
    } else {
      setVerifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("seller_verifications")
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Verification ${newStatus}` });
      fetchVerifications();
    }
    setUpdating(null);
  };

  const getDocUrl = async (path: string | null) => {
    if (!path) return;
    const { data } = await supabase.storage.from("seller-documents").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Seller Verification Review
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {verifications.length} total submissions • {verifications.filter(v => v.status === "pending").length} pending
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVerifications}>
          Refresh
        </Button>
      </div>

      {verifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No verification submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => {
            const config = statusConfig[v.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={v.id} className="rounded-xl bg-card border border-border p-5 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {v.verification_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      User: {v.user_id.slice(0, 8)}… • {new Date(v.created_at).toLocaleDateString()}
                    </p>
                    {v.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{v.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>

                  {v.storage_path && (
                    <Button variant="ghost" size="sm" onClick={() => getDocUrl(v.storage_path)}>
                      <ExternalLink className="w-3 h-3 mr-1" /> View
                    </Button>
                  )}

                  {v.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success/30 hover:bg-success/10"
                        onClick={() => updateStatus(v.id, "approved")}
                        disabled={updating === v.id}
                      >
                        {updating === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => updateStatus(v.id, "rejected")}
                        disabled={updating === v.id}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
