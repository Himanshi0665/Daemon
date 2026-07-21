import { DaemonStatusPanel } from '@/components/dashboard/DaemonStatusPanel'
import { CriticalToday } from '@/components/dashboard/CriticalToday'
import { TodaysFocus } from '@/components/dashboard/TodaysFocus'
import { InboxIntelligence } from '@/components/dashboard/InboxIntelligence'
import { AIDailySummaryClient } from '@/components/dashboard/AIDailySummaryClient'
import { UpcomingTimeline } from '@/components/dashboard/UpcomingTimeline'
import { PageHeader } from '@/components/ui/page-header'

/**
 * Dashboard — the primary view.
 * Answers: "What should I do right now?"
 *
 * All sections use mock data in Phase 2.
 * Phase 3: replace mock imports inside each component with real API calls.
 * No changes needed here when that happens.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Dashboard"
        description="Your AI-powered command centre"
      />

      {/* Row 1 — Daemon connection status */}
      <DaemonStatusPanel />

      {/* Row 2 — Most critical item */}
      <CriticalToday />

      {/* Row 3 — Focus + Inbox stats (2 columns on large screens) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodaysFocus />
        <InboxIntelligence />
      </div>

      {/* Row 4 — AI daily brief */}
      <AIDailySummaryClient />

      {/* Row 5 — Upcoming timeline */}
      <UpcomingTimeline />
    </div>
  )
}
