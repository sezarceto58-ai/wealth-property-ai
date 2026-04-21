import * as React from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, icon: Icon, trend }, ref) => {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    return (
      <div
        ref={ref}
        className="rounded-2xl bg-card border border-border p-4 lg:p-5 shadow-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-foreground leading-none">{value}</p>
            {change && (
              <p className={`mt-2 text-xs font-medium flex items-center gap-1 ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-red-500 dark:text-red-400"
                  : "text-muted-foreground"
              }`}>
                <TrendIcon className="w-3 h-3 shrink-0" />
                {change}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";
export default StatsCard;
