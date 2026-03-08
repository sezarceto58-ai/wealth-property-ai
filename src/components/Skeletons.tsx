export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-card border border-border p-4 animate-pulse ${className}`}>
      <div className="h-36 rounded-lg bg-muted/40 mb-3" />
      <div className="h-4 w-3/4 rounded bg-muted/40 mb-2" />
      <div className="h-3 w-1/2 rounded bg-muted/30" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted/40" />
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-muted/30 mb-2" />
          <div className="h-6 w-12 rounded bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted/40" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted/40" />
            <div className="h-3 w-1/3 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="h-10 w-full rounded-lg bg-muted/30" />
          {i === 0 && <div className="h-[200px] rounded-lg bg-muted/20" />}
        </div>
      ))}
    </div>
  );
}
