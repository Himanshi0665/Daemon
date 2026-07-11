import { ListChecks } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Tasks"
        description="AI-extracted action items from your emails"
      />

      <Card className="p-1">
        <EmptyState
          icon={ListChecks}
          title="Tasks — Coming Soon"
          description="Daemon will automatically extract action items from your emails and surface them here as trackable tasks. Connect Gmail and run a scan to get started."
          action={{ label: 'Go to Dashboard', href: '/dashboard' }}
          size="lg"
        />
      </Card>
    </div>
  )
}
