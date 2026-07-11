import { BarChart2 } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Email patterns and productivity insights
        </p>
      </div>
      <EmptyPageState
        icon={BarChart2}
        description="See how many interviews, deadlines, and opportunities Daemon has processed. Patterns emerge after a few weeks of scanning."
        phase="Available in Phase 5"
      />
    </div>
  )
}
