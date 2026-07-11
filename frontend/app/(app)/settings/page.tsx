import { Settings } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gmail, scan preferences, notifications, and account
        </p>
      </div>
      <EmptyPageState
        icon={Settings}
        description="Configure how often Daemon scans, set your confidence threshold, manage your Gmail connection, and adjust notification preferences."
        phase="Available in Phase 5"
      />
    </div>
  )
}
