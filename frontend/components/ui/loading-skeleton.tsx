import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Atomic shimmer skeleton block.
 * Size is controlled via className (h-*, w-*).
 * The shimmer animation is defined in globals.css (.skeleton).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn('skeleton rounded-md', className)}
      {...props}
    />
  )
}

/** Pre-built skeleton for a generic Card section. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border p-4 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

/** Pre-built skeleton for a list of items with leading avatars. */
export function SkeletonList({
  count = 3,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading...">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Pre-built skeleton for the full dashboard layout. */
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-5xl mx-auto space-y-4', className)}>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard className="min-h-[80px]" />
      <SkeletonCard className="min-h-[120px]" />
    </div>
  )
}
