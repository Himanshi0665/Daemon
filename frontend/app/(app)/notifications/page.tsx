import { Bell } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Deadline alerts, new opportunities, and scan updates
        </p>
      </div>
      <EmptyPageState
        icon={Bell}
        description="Daemon alerts you before critical deadlines, when new interviews arrive, and when low-confidence items need your review."
        phase="Available in Phase 4"
      />
    </div>
  )
}
