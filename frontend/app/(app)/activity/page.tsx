import { Activity } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function ActivityPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A log of every Daemon scan
        </p>
      </div>
      <EmptyPageState
        icon={Activity}
        description="Every scan Daemon runs is logged here — emails scanned, items created, items flagged for review, and any errors."
        phase="Available in Phase 5"
      />
    </div>
  )
}
