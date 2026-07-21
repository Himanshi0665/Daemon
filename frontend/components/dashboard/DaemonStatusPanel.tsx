import { Activity, Mail, Clock, Zap } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { getUserByClerkId } from '@backend/utils/auth'
import { getGmailAccount } from '@backend/repositories/gmailAccount.repository'
import { getSyncState } from '@backend/repositories/emailSyncState.repository'
import { getEmailStats } from '@backend/repositories/syncedEmail.repository'
import { SyncButton } from './SyncButton'
import { DisconnectButton } from './DisconnectButton'

/**
 * Daemon status bar — always visible at the top of the dashboard.
 *
 * Not connected → CTA to connect Gmail.
 * Connected     → 4 live stats + Sync Now + Disconnect buttons.
 *
 * Async Server Component — reads directly from the database.
 * No mock data. No API calls. Pure server-side rendering.
 */
export async function DaemonStatusPanel() {
  const { userId: clerkId } = await auth()

  // If somehow not authenticated, show the connect prompt
  if (!clerkId) {
    return <NotConnectedState />
  }

  const user = await getUserByClerkId(clerkId)
  if (!user) {
    return <NotConnectedState />
  }

  const gmailAccount = await getGmailAccount(user.id)

  if (!gmailAccount || !gmailAccount.isActive) {
    return <NotConnectedState reconnect={!!gmailAccount && !gmailAccount.isActive} />
  }

  // Account is connected — fetch live stats
  const [syncState, emailStats] = await Promise.all([
    getSyncState(user.id),
    getEmailStats(user.id),
  ])

  const statItems = [
    { label: 'Gmail', icon: Mail, value: gmailAccount.gmailAddress },
    { label: 'Last Sync', icon: Clock, value: formatRelativeTime(syncState?.lastSyncAt?.toISOString() ?? null) },
    { label: 'Emails', icon: Activity, value: String(emailStats.total) },
    { label: 'Unread', icon: Zap, value: String(emailStats.unread) },
  ]

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
              {item.value}
            </span>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <SyncButton />
          <DisconnectButton />
        </div>
      </div>
    </Card>
  )
}

function NotConnectedState({ reconnect = false }: { reconnect?: boolean }) {
  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Activity size={15} className="text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {reconnect
              ? 'Gmail access was revoked — reconnect to continue'
              : 'Connect Gmail to activate Daemon'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Read-only access · Encrypted tokens · Disconnect anytime
          </p>
        </div>
      </div>
      <a href="/api/gmail/connect">
        <Button size="sm" className="w-full sm:w-auto">
          {reconnect ? 'Reconnect Gmail →' : 'Connect Gmail →'}
        </Button>
      </a>
    </Card>
  )
}
