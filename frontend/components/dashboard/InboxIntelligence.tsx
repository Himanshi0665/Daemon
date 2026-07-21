import { Mail, Eye, Star, Briefcase, FileText, Users, Calendar, AlertCircle, Info, TrendingUp, BookOpen, CreditCard, Tag } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { Divider } from '@/components/ui/divider'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeTime } from '@/lib/format'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getEmailStats } from '@backend/repositories/syncedEmail.repository'
import { getSyncState } from '@backend/repositories/emailSyncState.repository'
import { getInboxIntelligenceStats, getActionableCount } from '@backend/repositories/item.repository'

export async function InboxIntelligence() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await requireUserByClerkId(clerkId)
  
  const [emailStats, syncState, categoryStats, actionableCount] = await Promise.all([
    getEmailStats(user.id),
    getSyncState(user.id),
    getInboxIntelligenceStats(user.id),
    getActionableCount(user.id)
  ])

  const stats = emailStats
  const lastSyncAt = syncState?.lastSyncAt?.toISOString() ?? null

  const lastScan = formatRelativeTime(lastSyncAt)
  const hasData = stats.total > 0

  const getCategoryCount = (cat: string) => categoryStats.find(c => c.category === cat)?.count || 0

  const insights = [
    { label: `You have ${actionableCount} emails requiring action.`, icon: AlertCircle, count: actionableCount },
    { label: `${getCategoryCount('INTERVIEW')} interview-related emails.`, icon: Briefcase, count: getCategoryCount('INTERVIEW') },
    { label: `${getCategoryCount('DEADLINE')} learning emails.`, icon: BookOpen, count: getCategoryCount('DEADLINE') },
    { label: `${getCategoryCount('GENERAL')} promotional emails.`, icon: Tag, count: getCategoryCount('GENERAL') },
    { label: `${getCategoryCount('ONLINE_ASSESSMENT')} online assessment pending.`, icon: FileText, count: getCategoryCount('ONLINE_ASSESSMENT') },
    { label: `${getCategoryCount('RECRUITER')} recruiter emails.`, icon: Users, count: getCategoryCount('RECRUITER') },
    { label: `${getCategoryCount('FORM')} bills or invoices.`, icon: CreditCard, count: getCategoryCount('FORM') },
    { label: `${getCategoryCount('ASSIGNMENT')} college assignments.`, icon: BookOpen, count: getCategoryCount('ASSIGNMENT') },
  ].filter(i => i.count > 0)

  return (
    <Card className="p-4">
      <SectionTitle
        title="Inbox Intelligence"
        subtitle={`Last scan: ${lastScan}`}
        className="mb-3"
      />

      {!hasData && !lastSyncAt ? (
        <EmptyState
          title="No scan yet"
          description="Connect Gmail and sync to see your inbox breakdown."
          size="sm"
        />
      ) : (
        <div className="flex flex-col gap-0 max-h-[300px] overflow-y-auto pr-2">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No new insights right now.</p>
          ) : (
            insights.map((row, i) => (
              <div key={row.label}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <row.icon
                      size={13}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="text-sm text-foreground">
                      {row.label}
                    </span>
                  </div>
                </div>
                {i < insights.length - 1 && <Divider />}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  )
}
