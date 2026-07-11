import { Mail, Eye, Tag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { Divider } from '@/components/ui/divider'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeTime } from '@/lib/format'
// Toggle: mockInboxStats (empty) or mockInboxStatsPopulated
import { mockInboxStatsPopulated as stats } from '@/lib/mock-data'

const rows = [
  { label: 'Important Emails', icon: Mail, key: 'importantEmails' as const },
  { label: 'Unread Actionable', icon: Eye, key: 'unreadActionable' as const },
  { label: 'Hidden Promotions', icon: Tag, key: 'hiddenPromotions' as const },
] as const

/**
 * Inbox intelligence stat panel.
 * Server component. Replace mock import with API call in Phase 3.
 */
export function InboxIntelligence() {
  const lastScan = formatRelativeTime(stats.lastScanAt)
  const hasData = stats.importantEmails > 0 || stats.unreadActionable > 0

  return (
    <Card className="p-4">
      <SectionTitle
        title="Inbox Intelligence"
        subtitle={`Last scan: ${lastScan}`}
        className="mb-3"
      />

      {!hasData && !stats.lastScanAt ? (
        <EmptyState
          title="No scan yet"
          description="Run a scan to see your inbox breakdown."
          size="sm"
        />
      ) : (
        <div>
          {rows.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <row.icon
                    size={13}
                    className="shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {stats[row.key]}
                </span>
              </div>
              {i < rows.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
