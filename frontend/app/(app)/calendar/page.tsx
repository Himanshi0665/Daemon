import { CalendarClock } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Calendar"
        description="Interviews, meetings, and deadlines in one view"
      />

      <Card className="p-1">
        <EmptyState
          icon={CalendarClock}
          title="Calendar — Coming Soon"
          description="Daemon will build a unified calendar from your Gmail — interviews, OA deadlines, meetings, and form submissions, all in one place. Connect Gmail to get started."
          action={{ label: 'Go to Dashboard', href: '/dashboard' }}
          size="lg"
        />
      </Card>
    </div>
  )
}
