export function Skeleton({ className = "" }) {
  return (
    <div className={`bg-border-custom/50 rounded-lg animate-pulse ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border-custom rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function ChartSkeleton({ height = "h-48" }) {
  return <Skeleton className={`w-full ${height} rounded-xl`} />
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <div className="grid gap-4 px-5 py-4 border-b border-border-custom"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  )
}