import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  className?: string
}

/**
 * Single stat display row.
 * Used inside InboxIntelligence and similar metric panels.
 * Server component.
 */
export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-3 py-2.5', className)}>
      {Icon && (
        <Icon
          size={14}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}
