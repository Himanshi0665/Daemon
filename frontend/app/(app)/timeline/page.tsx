import { CalendarDays } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function TimelinePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Deadlines, interviews, and meetings in chronological order
        </p>
      </div>
      <EmptyPageState
        icon={CalendarDays}
        description="All your extracted events laid out on a timeline. Daemon builds this automatically from your inbox."
        phase="Available in Phase 4"
      />
    </div>
  )
}
