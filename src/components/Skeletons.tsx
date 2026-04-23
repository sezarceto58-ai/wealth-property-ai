export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border overflow-hidden animate-pulse ${className}`}>
      <div className="h-44 bg-muted/40" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded-lg bg-muted/40" />
        <div className="h-3 w-1/2 rounded-lg bg-muted/30" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-12 rounded bg-muted/30" />
          <div className="h-3 w-12 rounded bg-muted/30" />
          <div className="h-3 w-14 rounded bg-muted/30" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 lg:p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-muted/30" />
          <div className="h-7 w-16 rounded-lg bg-muted/40" />
          <div className="h-3 w-14 rounded bg-muted/25" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-muted/40 shrink-0" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border animate-pulse p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted/40 shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 w-2/3 rounded-lg bg-muted/40" />
            <div className="h-3 w-1/3 rounded-lg bg-muted/30" />
          </div>
          <div className="w-16 h-8 rounded-lg bg-muted/30 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="h-4 w-32 rounded-lg bg-muted/40" />
          <div className="h-10 w-full rounded-xl bg-muted/30" />
          {i === 0 && <div className="h-[200px] rounded-xl bg-muted/20" />}
        </div>
      ))}
    </div>
  );
}
