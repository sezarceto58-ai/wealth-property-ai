import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number | null;
}

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const isUnlimited = !limit || limit >= 9999;
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const barColor = pct >= 95 ? "bg-[#ef4444]" : pct >= 80 ? "bg-[#f59e0b]" : "bg-[#10b981]";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#6b7280]">{label}</span>
        <span className="text-white font-mono text-xs">
          {current} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 bg-[#2a2d3a] rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: isUnlimited ? "5%" : `${pct}%` }} />
      </div>
    </div>
  );
}
