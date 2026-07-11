import { CalendarDays, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { CategoryBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Divider } from '@/components/ui/divider'
import { cn } from '@/lib/utils'
import { getTimelineBucket, formatDate, formatTime } from '@/lib/format'
import type { TimelineItem } from '@/lib/mock-data'
// Toggle: mockTimelineItems (empty) or mockTimelineItemsPopulated
import { mockTimelineItemsPopulated as items } from '@/lib/mock-data'

const BUCKET_LABELS: Record<string, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This Week',
  'next-week': 'Next Week',
  later: 'Later',
}

const BUCKET_ORDER = ['today', 'tomorrow', 'this-week', 'next-week', 'later']

function groupByBucket(
  items: TimelineItem[],
): Record<string, TimelineItem[]> {
  return items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
    const bucket = getTimelineBucket(item.date)
    return { ...acc, [bucket]: [...(acc[bucket] ?? []), item] }
  }, {})
}

/**
 * Upcoming events grouped by time bucket.
 * Server component. Replace mock import with API call in Phase 3.
 */
export function UpcomingTimeline() {
  if (items.length === 0) {
    return (
      <Card className="p-4">
        <SectionTitle title="Upcoming" className="mb-3" />
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events"
          description="Daemon will populate your timeline after the first Gmail scan."
          size="sm"
        />
      </Card>
    )
  }

  const groups = groupByBucket(items)
  const activeBuckets = BUCKET_ORDER.filter((b) => groups[b]?.length)

  return (
    <Card className="p-4">
      <SectionTitle title="Upcoming" className="mb-4" />

      <div className="space-y-5">
        {activeBuckets.map((bucket, bi) => (
          <div key={bucket}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {BUCKET_LABELS[bucket]}
            </p>

            <div className="space-y-0.5">
              {groups[bucket].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors"
                >
                  {/* Dot */}
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" aria-hidden />

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {item.company && (
                        <span className="text-muted-foreground">
                          {item.company} —{' '}
                        </span>
                      )}
                      {item.title}
                    </p>
                    {item.eventTime && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(item.date)} · {formatTime(item.eventTime)}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex shrink-0 items-center gap-2">
                    <CategoryBadge category={item.category} />
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Join ${item.title} meeting`}
                      >
                        <ExternalLink size={12} aria-hidden />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {bi < activeBuckets.length - 1 && <Divider className="mt-4" />}
          </div>
        ))}
      </div>
    </Card>
  )
}
