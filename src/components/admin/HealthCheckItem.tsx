import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface HealthCheckItemProps {
  name: string;
  status: "healthy" | "warning" | "error";
  latency?: number;
  message: string;
  lastChecked: string;
}

const statusConfig = {
  healthy: { icon: CheckCircle, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  warning: { icon: AlertTriangle, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  error: { icon: XCircle, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
};

export function HealthCheckItem({ name, status, latency, message, lastChecked }: HealthCheckItemProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("border border-[#2a2d3a] rounded-lg p-4 flex items-center gap-4", config.bg)}>
      <Icon className={cn("h-6 w-6 shrink-0", config.color)} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white">{name}</div>
        <div className="text-xs text-[#6b7280]">{message}</div>
      </div>
      <div className="text-right shrink-0">
        {latency !== undefined && <div className="text-xs font-mono text-[#6b7280]">{latency}ms</div>}
        <div className="text-xs text-[#6b7280]">{new Date(lastChecked).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
