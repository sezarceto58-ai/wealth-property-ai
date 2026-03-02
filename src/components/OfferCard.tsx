import { useState } from "react";
import { BadgeCheck, Clock, FileText } from "lucide-react";
import type { Offer } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

function PlanBadge({ plan }: { plan: Offer["buyerPlan"] }) {
  const styles = {
    elite: "bg-primary/20 text-primary border-primary/30",
    pro: "bg-info/20 text-info border-info/30",
    free: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold uppercase ${styles[plan]}`}>
      {plan}
    </span>
  );
}

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

function StatusBadge({ status }: { status: Offer["status"] }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-info/10 text-info",
    VIEWED: "bg-primary/10 text-primary",
    ACCEPTED: "bg-success/10 text-success",
    REJECTED: "bg-destructive/10 text-destructive",
    COUNTERED: "bg-warning/10 text-warning",
    EXPIRED: "bg-secondary text-muted-foreground",
    WITHDRAWN: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function OfferCard({ offer, showActions = false, onStatusChange }: { 
  offer: Offer; 
  showActions?: boolean;
  onStatusChange?: (offerId: string, newStatus: Offer["status"]) => void;
}) {
  const { toast } = useToast();
  const [localStatus, setLocalStatus] = useState(offer.status);
  const pricePercent = Math.round((offer.offerPrice / offer.askingPrice) * 100);

  const handleAction = (action: "ACCEPTED" | "COUNTERED" | "REJECTED") => {
    setLocalStatus(action);
    onStatusChange?.(offer.id, action);
    const labels = { ACCEPTED: "accepted", COUNTERED: "countered", REJECTED: "rejected" };
    toast({
      title: `Offer ${labels[action]}`,
      description: `${offer.buyerName}'s offer on ${offer.propertyTitle} has been ${labels[action]}.`,
    });
  };

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-fade-in hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{offer.id}</span>
            <StatusBadge status={localStatus} />
          </div>
          <h3 className="font-semibold text-foreground">{offer.propertyTitle}</h3>
        </div>
        <ScoreBadge score={offer.seriousnessScore} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Buyer</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-medium text-foreground">{offer.buyerName}</p>
            <PlanBadge plan={offer.buyerPlan} />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Offer Price</p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            ${offer.offerPrice.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({pricePercent}% of asking)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {offer.closingTimeline} days
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{offer.financingType}</span>
          {offer.depositPercent && (
            <span className="flex items-center gap-1 text-primary">
              <BadgeCheck className="w-3 h-3" /> {offer.depositPercent}% deposit
            </span>
          )}
          {offer.proofUploaded && (
            <span className="flex items-center gap-1 text-success">
              <FileText className="w-3 h-3" /> Proof
            </span>
          )}
        </div>
      </div>

      {offer.message && (
        <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
          "{offer.message}"
        </p>
      )}

      {showActions && localStatus === "SUBMITTED" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button onClick={() => handleAction("ACCEPTED")} className="flex-1 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">
            Accept
          </button>
          <button onClick={() => handleAction("COUNTERED")} className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Counter
          </button>
          <button onClick={() => handleAction("REJECTED")} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            Reject
          </button>
        </div>
      )}

      {showActions && localStatus === "VIEWED" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button onClick={() => handleAction("ACCEPTED")} className="flex-1 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">
            Accept
          </button>
          <button onClick={() => handleAction("COUNTERED")} className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Counter
          </button>
          <button onClick={() => handleAction("REJECTED")} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
