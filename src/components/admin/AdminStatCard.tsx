import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}

const colorMap = {
  indigo: "border-l-[#6366f1]",
  emerald: "border-l-[#10b981]",
  amber: "border-l-[#f59e0b]",
  rose: "border-l-[#ef4444]",
  slate: "border-l-[#6b7280]",
};

export function AdminStatCard({ title, value, subtext, trend, icon: Icon, color = "indigo" }: AdminStatCardProps) {
  return (
    <div className={cn("bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-5 border-l-4", colorMap[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#6b7280] text-sm font-medium">{title}</span>
        {Icon && <Icon className="h-4 w-4 text-[#6b7280]" />}
      </div>
      <div className="font-inter text-2xl font-bold text-white">{value}</div>
      {subtext && (
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" && <span className="text-[#10b981] text-xs">↑</span>}
          {trend === "down" && <span className="text-[#ef4444] text-xs">↓</span>}
          <span className="text-[#6b7280] text-xs">{subtext}</span>
        </div>
      )}
    </div>
  );
}
