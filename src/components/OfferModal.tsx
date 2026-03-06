import { useState } from "react";
import { X, Upload, DollarSign, Check } from "lucide-react";
import type { DbProperty } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useCreateOffer } from "@/hooks/useOffers";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

interface OfferModalProps {
  property: DbProperty;
  onClose: () => void;
}

export default function OfferModal({ property, onClose }: OfferModalProps) {
  const { toast } = useToast();
  const createOffer = useCreateOffer();
  const { tier } = useSubscription();
  const [offerPrice, setOfferPrice] = useState(property.price.toString());
  const [currency, setCurrency] = useState<"USD" | "IQD">("USD");
  const [offerType, setOfferType] = useState<"BUY" | "RENT">("BUY");
  const [financing, setFinancing] = useState<"CASH" | "MORTGAGE">("CASH");
  const [timeline, setTimeline] = useState("30");
  const [message, setMessage] = useState("");
  const [addDeposit, setAddDeposit] = useState(false);
  const [depositPercent, setDepositPercent] = useState("10");
  const [submitted, setSubmitted] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!offerPrice || Number(offerPrice) <= 0) {
      toast({ title: "Invalid price", description: "Please enter a valid offer price.", variant: "destructive" });
      return;
    }
    try {
      const created = await createOffer.mutateAsync({
        property_id: property.id,
        seller_id: property.user_id,
        offer_price: Number(offerPrice),
        currency,
        asking_price: property.price,
        offer_type: offerType,
        financing_type: financing,
        closing_timeline_days: Number(timeline),
        deposit_percent: addDeposit ? Number(depositPercent) : undefined,
        message: message || undefined,
        wants_proof_upload: !!proofFile,
      } as any);

      // Proof-of-funds upload (Elite only; server enforces at create-offer)
      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop() || "pdf";
        const safeName = `proof.${fileExt}`;
        const objectPath = `${created.buyer_id}/${created.id}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("offer-documents")
          .upload(objectPath, proofFile, { upsert: true, contentType: proofFile.type || undefined });

        if (uploadError) throw uploadError;

        const { data: pub } = supabase.storage.from("offer-documents").getPublicUrl(objectPath);
        const url = pub?.publicUrl;

        await supabase
          .from("offer_documents" as any)
          .insert({
            offer_id: created.id,
            property_id: created.property_id,
            uploader_id: created.buyer_id,
            doc_type: "proof_of_funds",
            storage_path: objectPath,
            url,
          } as any);

        await supabase
          .rpc("set_offer_proof_uploaded" as any, { p_offer_id: created.id, p_value: true } as any);
      }

      setSubmitted(true);
      toast({ title: "Offer submitted!", description: `Your offer of $${Number(offerPrice).toLocaleString()} has been sent.` });
      setTimeout(onClose, 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-elevated p-8 animate-scale-in text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Offer Sent!</h2>
          <p className="text-sm text-muted-foreground mt-2">Your offer of ${Number(offerPrice).toLocaleString()} has been submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-elevated p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Send Offer</h2>
            <p className="text-sm text-muted-foreground mt-1">{property.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Offer Price</label>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="USD">USD</option>
                <option value="IQD">IQD</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Asking: ${property.price.toLocaleString()} USD</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Offer Type</label>
              <div className="flex gap-2 mt-1.5">
                {(["BUY", "RENT"] as const).map((t) => (
                  <button key={t} onClick={() => setOfferType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${offerType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Financing</label>
              <div className="flex gap-2 mt-1.5">
                {(["CASH", "MORTGAGE"] as const).map((f) => (
                  <button key={f} onClick={() => setFinancing(f)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${financing === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Closing Timeline</label>
            <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm">
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Message (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Add a note to the seller..." className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm resize-none" />
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">⭐ Elite Options</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={addDeposit} onChange={(e) => setAddDeposit(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-foreground">Add Deposit Commitment</span>
            </label>
            {addDeposit && (
              <div className="mt-3 flex items-center gap-2">
                <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Upload Proof of Funds</span>
            </label>

            <div className="mt-2">
              <input
                type="file"
                accept="application/pdf,image/*"
                disabled={tier !== "elite"}
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:text-foreground file:text-sm disabled:opacity-50"
              />
              {tier !== "elite" && (
                <p className="text-xs text-muted-foreground mt-1">Upgrade to Elite to enable proof-of-funds uploads.</p>
              )}
              {proofFile && (
                <p className="text-xs text-foreground mt-1">Selected: {proofFile.name}</p>
              )}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={createOffer.isPending} className="w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50">
            {createOffer.isPending ? "Submitting..." : "Submit Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
