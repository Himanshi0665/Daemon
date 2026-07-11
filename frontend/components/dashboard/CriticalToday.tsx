'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { CheckCircle } from 'lucide-react'
// Toggle: mockCriticalItem (null → empty state) or mockCriticalItemPopulated
import { mockCriticalItemPopulated as item } from '@/lib/mock-data'

/** Live countdown string from a target ISO date. Updates every 30s. */
function useCountdown(isoDate: string | null | undefined): string {
  const [label, setLabel] = useState<string>('—')

  useEffect(() => {
    if (!isoDate) return

    const update = () => {
      const diff = new Date(isoDate).getTime() - Date.now()
      if (diff <= 0) {
        setLabel('Deadline passed')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setLabel(h > 0 ? `${h}h ${m}m left` : `${m}m left`)
    }

    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [isoDate])

  return label
}

/**
 * Full-width critical item strip.
 * Client component for live countdown.
 * Replace mock import with API call in Phase 3.
 */
export function CriticalToday() {
  const countdown = useCountdown(item?.deadline)

  if (!item) {
    return (
      <Card className="px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Critical Today
        </p>
        <EmptyState
          icon={CheckCircle}
          title="You're clear"
          description="No critical deadlines today. Good time to get ahead."
          size="sm"
        />
      </Card>
    )
  }

  return (
    <Card className="border-l-[3px] border-l-destructive px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Critical
            </span>
            <CategoryBadge category={item.category} />
          </div>

          <p className="truncate text-sm font-semibold text-foreground">
            {item.company && (
              <span className="text-muted-foreground">{item.company} — </span>
            )}
            {item.title}
          </p>

          <p
            className="mt-1 text-xs font-medium text-destructive tabular-nums"
            aria-live="polite"
            aria-label={`Countdown: ${countdown}`}
          >
            {countdown}
          </p>
        </div>

        <Button size="sm" variant="outline" aria-label={`View ${item.title}`}>
          View →
        </Button>
      </div>
    </Card>
  )
}
