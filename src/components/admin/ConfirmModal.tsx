import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (reason: string) => void;
  destructive?: boolean;
  requireReason?: boolean;
  loading?: boolean;
}

export function ConfirmModal({ open, onOpenChange, title, description, onConfirm, destructive = false, requireReason = true, loading }: ConfirmModalProps) {
  const [reason, setReason] = useState("");
  const canConfirm = !requireReason || reason.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1d27] border-[#2a2d3a] text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[#6b7280]">{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <div className="space-y-2">
            <label className="text-sm text-[#6b7280]">Reason for this action (required, min 10 chars)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why you're taking this action..." className="bg-[#0f1117] border-[#2a2d3a] text-white" />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a2d3a] text-[#6b7280]">Cancel</Button>
          <Button disabled={!canConfirm || loading} onClick={() => { onConfirm(reason); setReason(""); onOpenChange(false); }} className={destructive ? "bg-[#ef4444] hover:bg-[#dc2626]" : "bg-[#6366f1] hover:bg-[#4f46e5]"}>
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
