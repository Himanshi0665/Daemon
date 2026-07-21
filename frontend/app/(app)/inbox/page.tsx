import { Inbox } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { EmptyPageState } from '@/components/ui/empty-page-state'
import { InboxClient } from '@/components/inbox/InboxClient'
import { getUserByClerkId } from '@backend/utils/auth'
import { getGmailAccount } from '@backend/repositories/gmailAccount.repository'
import { getEmailsByUser, getEmailStats } from '@backend/repositories/syncedEmail.repository'

/**
 * Inbox page — shows real synced emails from the database.
 *
 * Server component loads initial data, client component handles
 * search, filters, pagination, and loading states.
 */
export default async function InboxPage() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return <NotConnected />
  }

  const user = await getUserByClerkId(clerkId)
  if (!user) {
    return <NotConnected />
  }

  const gmailAccount = await getGmailAccount(user.id)

  if (!gmailAccount || !gmailAccount.isActive) {
    return <NotConnected />
  }

  // Fetch initial data server-side for fast first paint
  const [result, stats] = await Promise.all([
    getEmailsByUser(user.id, { limit: 30 }),
    getEmailStats(user.id),
  ])

  const serializedEmails = result.emails.map((e) => ({
    ...e,
    receivedAt: e.receivedAt.toISOString(),
  }))

  return (
    <InboxClient
      initialEmails={serializedEmails}
      initialTotal={result.total}
      initialHasMore={result.hasMore}
      stats={stats}
      gmailAddress={gmailAccount.gmailAddress}
    />
  )
}

function NotConnected() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your synced Gmail emails
        </p>
      </div>
      <EmptyPageState
        icon={Inbox}
        description="Connect Gmail to see your emails here. Daemon reads your inbox with read-only access."
        actionLabel="Connect Gmail"
        actionHref="/api/gmail/connect"
      />
    </div>
  )
}
