import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/format'

type Email = {
  id: string
  messageId: string
  senderName: string | null
  senderEmail: string
  subject: string
  snippet: string
  receivedAt: string
  labels: string[]
  isRead: boolean
  isStarred: boolean
}

/**
 * Renders a list of synced emails.
 * Server component — receives data as props, no client-side fetching.
 */
export function EmailList({
  emails,
  total,
  hasMore,
}: {
  emails: Email[]
  total: number
  hasMore: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">
        Showing {emails.length} of {total} emails
      </p>

      <Card className="divide-y divide-border">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/30 ${
              !email.isRead ? 'bg-primary/[0.02]' : ''
            }`}
          >
            {/* Unread indicator */}
            <div className="mt-2 flex shrink-0 items-center gap-1.5">
              {!email.isRead && (
                <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
              )}
              {email.isRead && <span className="h-2 w-2" />}
              {email.isStarred && (
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`truncate text-sm ${!email.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                  {email.senderName || email.senderEmail}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatRelativeTime(email.receivedAt)}
                </span>
              </div>

              <p className={`truncate text-sm mt-0.5 ${!email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {email.subject}
              </p>

              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {email.snippet}
              </p>
            </div>
          </div>
        ))}
      </Card>

      {hasMore && (
        <p className="text-center text-xs text-muted-foreground py-4">
          More emails available — sync again for the latest
        </p>
      )}
    </div>
  )
}
