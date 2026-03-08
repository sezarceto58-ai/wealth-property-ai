import { cn } from "@/lib/utils";

type StatusType = "active" | "suspended" | "trial" | "free" | "pro" | "elite" | "completed" | "failed" | "processing" | "partial" | "draft" | "scheduled" | "sent" | "success" | "healthy" | "warning" | "error" | "in_stock" | "low_stock" | "out_of_stock";

const statusColors: Record<string, string> = {
  active: "bg-[#10b981]/20 text-[#10b981]",
  suspended: "bg-[#ef4444]/20 text-[#ef4444]",
  trial: "bg-[#f59e0b]/20 text-[#f59e0b]",
  free: "bg-[#6b7280]/20 text-[#6b7280]",
  pro: "bg-[#6366f1]/20 text-[#6366f1]",
  elite: "bg-[#8b5cf6]/20 text-[#8b5cf6]",
  completed: "bg-[#10b981]/20 text-[#10b981]",
  success: "bg-[#10b981]/20 text-[#10b981]",
  healthy: "bg-[#10b981]/20 text-[#10b981]",
  failed: "bg-[#ef4444]/20 text-[#ef4444]",
  error: "bg-[#ef4444]/20 text-[#ef4444]",
  out_of_stock: "bg-[#ef4444]/20 text-[#ef4444]",
  processing: "bg-[#6366f1]/20 text-[#6366f1]",
  partial: "bg-[#f59e0b]/20 text-[#f59e0b]",
  warning: "bg-[#f59e0b]/20 text-[#f59e0b]",
  low_stock: "bg-[#f59e0b]/20 text-[#f59e0b]",
  draft: "bg-[#6b7280]/20 text-[#6b7280]",
  scheduled: "bg-[#3b82f6]/20 text-[#3b82f6]",
  sent: "bg-[#10b981]/20 text-[#10b981]",
  in_stock: "bg-[#10b981]/20 text-[#10b981]",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colorClass = statusColors[status] ?? "bg-[#6b7280]/20 text-[#6b7280]";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", colorClass, className)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
