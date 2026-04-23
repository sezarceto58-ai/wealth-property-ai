import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Clock, FileText } from "lucide-react";
import type { DbOffer } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useUpdateOfferStatus } from "@/hooks/useOffers";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  const label = score >= 80 ? "🟢 High Intent" : score >= 50 ? "🟡 Medium Intent" : "🔴 Low Intent";
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <span className="text-sm font-bold">{score}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-info/10 text-info",
    VIEWED: "bg-primary/10 text-primary",
    ACCEPTED: "bg-success/10 text-success",
    REJECTED: "bg-destructive/10 text-destructive",
    COUNTERED: "bg-warning/10 text-warning",
    EXPIRED: "bg-secondary text-muted-foreground",
    WITHDRAWN: "bg-secondary text-muted-foreground",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || "bg-secondary text-muted-foreground"}`}>{status}</span>;
}

export default function OfferCard({ offer, showActions = false }: { offer: DbOffer; showActions?: boolean }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateStatus = useUpdateOfferStatus();
  const [localStatus, setLocalStatus] = useState(offer.status);
  const pricePercent = offer.asking_price ? Math.round((offer.offer_price / offer.asking_price) * 100) : 0;

  const handleAction = (action: "ACCEPTED" | "COUNTERED" | "REJECTED") => {
    setLocalStatus(action);
    updateStatus.mutate({ id: offer.id, status: action });
    toast({ title: `Offer ${action.toLowerCase()}`, description: `Offer has been ${action.toLowerCase()}.` });
  };

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-fade-in hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{offer.id.slice(0, 8)}</span>
            <StatusBadge status={localStatus} />
          </div>
        </div>
        <ScoreBadge score={offer.seriousness_score} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Offer Price</p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            ${offer.offer_price.toLocaleString()}{" "}
            {offer.asking_price && (
              <span className="text-xs font-normal text-muted-foreground">({pricePercent}% of asking)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" /> {offer.closing_timeline_days} days
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{offer.financing_type}</span>
          {offer.deposit_percent && (
            <span className="flex items-center gap-1 text-primary">
              <BadgeCheck className="w-3 h-3" /> {offer.deposit_percent}% deposit
            </span>
          )}
          {offer.proof_uploaded && (
            <span className="flex items-center gap-1 text-success">
              <FileText className="w-3 h-3" /> Proof
            </span>
          )}
        </div>
      </div>

      {offer.message && (
        <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">"{offer.message}"</p>
      )}

      {showActions && (localStatus === "SUBMITTED" || localStatus === "VIEWED") && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button onClick={() => handleAction("ACCEPTED")} className="flex-1 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">Accept</button>
          <button onClick={() => handleAction("COUNTERED")} className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">Counter</button>
          <button onClick={() => handleAction("REJECTED")} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">Reject</button>
        </div>
      )}
    </div>
  );
}
