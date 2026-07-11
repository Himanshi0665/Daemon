import { Activity, Mail, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
// Toggle between mockDaemonStatus (disconnected) and mockDaemonStatusConnected (connected)
import { mockDaemonStatusConnected as status } from '@/lib/mock-data'

const statItems = [
  { label: 'Gmail', icon: Mail, getValue: () => status.gmailEmail ?? '—' },
  { label: 'Last Scan', icon: Clock, getValue: () => formatRelativeTime(status.lastScanAt) },
  { label: 'Emails Today', icon: Activity, getValue: () => String(status.emailsProcessedToday) },
  { label: 'Frequency', icon: Zap, getValue: () => `Every ${status.scanFrequencyMins}m` },
]

/**
 * Daemon status bar — always visible at the top of the dashboard.
 *
 * Not connected → CTA to connect Gmail.
 * Connected     → 4 live stats + Scan Now button.
 *
 * Server component. Replace mock import with API call in Phase 3.
 */
export function DaemonStatusPanel() {
  if (!status.gmailConnected) {
    return (
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Activity size={15} className="text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Connect Gmail to activate Daemon
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Read-only access · No emails stored · Disconnect anytime
            </p>
          </div>
        </div>
        <Link href="/api/gmail/connect">
          <Button size="sm" className="w-full sm:w-auto">
            Connect Gmail →
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {/* Connected indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-500"
            aria-label="Connected"
          />
          <span className="text-xs font-medium text-green-600">Connected</span>
        </div>

        {/* Stats */}
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <item.icon size={13} className="shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-xs text-muted-foreground">{item.label}:</span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {item.getValue()}
            </span>
          </div>
        ))}

        <div className="ml-auto">
          <Button size="sm" variant="outline" aria-label="Run a manual scan now">
            Scan Now
          </Button>
        </div>
      </div>
    </Card>
  )
}
