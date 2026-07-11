import { CheckSquare } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function ActionCenterPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Action Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Every actionable email becomes a task
        </p>
      </div>
      <EmptyPageState
        icon={CheckSquare}
        description="Daemon auto-generates tasks from emails that require action. Connect Gmail to start building your task list."
        phase="Available in Phase 4"
      />
    </div>
  )
}
