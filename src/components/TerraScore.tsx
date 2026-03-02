interface TerraScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function TerraScore({ score, size = "md", showLabel = true }: TerraScoreProps) {
  const getColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getLabel = () => {
    if (score >= 80) return "High Investment";
    if (score >= 50) return "Moderate";
    return "Low Score";
  };

  const getEmoji = () => {
    if (score >= 80) return "🟢";
    if (score >= 50) return "🟡";
    return "🔴";
  };

  const dims = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${dims} rounded-full border-2 border-current flex items-center justify-center ${getColor()}`}
        style={{ "--score": score } as React.CSSProperties}
      >
        <span className={`font-bold ${textSize}`}>{score}</span>
      </div>
      {showLabel && (
        <div>
          <p className={`text-xs font-semibold ${getColor()}`}>
            {getEmoji()} TerraScore
          </p>
          <p className="text-xs text-muted-foreground">{getLabel()}</p>
        </div>
      )}
    </div>
  );
}
