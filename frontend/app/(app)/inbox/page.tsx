import { Inbox } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function InboxPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Inbox Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your AI-processed emails, classified and prioritized
        </p>
      </div>
      <EmptyPageState
        icon={Inbox}
        description="Connect Gmail and run your first scan. Daemon will classify every email and surface only what matters."
        phase="Available in Phase 3"
      />
    </div>
  )
}
