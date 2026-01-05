export function StatSkeleton({ primary }) {
  return (
    <div
      className={`rounded-2xl p-6 animate-pulse
        ${primary ? "bg-primary/20" : "bg-muted"}
      `}
    >
      <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
      <div className="h-8 w-32 mt-4 bg-muted-foreground/30 rounded" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 animate-pulse">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </>
  );
}
