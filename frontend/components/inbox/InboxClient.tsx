'use client'

function getCategoryDisplayName(category: string): string {
  const map: Record<string, string> = {
    INTERVIEW: 'Interview',
    ONLINE_ASSESSMENT: 'Online Assessment',
    RECRUITER: 'Recruiter',
    OFFER: 'Placement',
    MEETING: 'Internship',
    ASSIGNMENT: 'College',
    DEADLINE: 'Learning',
    FORM: 'Bills',
    REJECTION: 'Subscriptions',
    GENERAL: 'Promotion',
    PERSONAL: 'Personal'
  }
  return map[category] || category
}

import { useState, useCallback, useEffect } from 'react'
import {
  Search,
  Star,
  Eye,
  Inbox,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

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
  category?: string
  actionRequired?: string
}

type FilterType = 'all' | 'unread' | 'starred'

const PAGE_SIZE = 30

import { useRouter } from 'next/navigation'

export function InboxClient({
  initialEmails,
  initialTotal,
  initialHasMore,
  stats,
  gmailAddress,
}: {
  initialEmails: Email[]
  initialTotal: number
  initialHasMore: boolean
  stats: { total: number; unread: number; starred: number }
  gmailAddress: string
}) {
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [total, setTotal] = useState(initialTotal)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchEmails = useCallback(
    async (opts: { page: number; filter: FilterType; search: string }) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', String(PAGE_SIZE))
        params.set('offset', String(opts.page * PAGE_SIZE))
        if (opts.filter === 'unread') params.set('unread', 'true')
        if (opts.filter === 'starred') params.set('starred', 'true')
        if (opts.search) params.set('search', opts.search)

        const res = await fetch(`/api/emails?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setEmails(data.emails)
        setTotal(data.total)
        setHasMore(data.hasMore)
      } catch (err) {
        console.error('[InboxClient] fetch error:', err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Re-fetch when filter or page changes
  useEffect(() => {
    // Skip initial load (server-rendered data handles page 0 with no filters)
    if (page === 0 && filter === 'all' && search === '') return
    fetchEmails({ page, filter, search })
  }, [page, filter, search, fetchEmails])

  function handleSearch() {
    setSearch(searchInput)
    setPage(0)
  }

  function handleFilterChange(f: FilterType) {
    setFilter(f)
    setPage(0)
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' })
      if (res.ok) {
        // Re-fetch current view after sync
        await fetchEmails({ page: 0, filter, search })
        setPage(0)
      }
    } catch {
      // ignore
    } finally {
      setSyncing(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const filterButtons: { key: FilterType; label: string; icon: typeof Mail; count?: number }[] = [
    { key: 'all', label: 'All', icon: Mail, count: stats.total },
    { key: 'unread', label: 'Unread', icon: Eye, count: stats.unread },
    { key: 'starred', label: 'Starred', icon: Star, count: stats.starred },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {gmailAddress} · {total} emails
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          <span className="ml-1.5">{syncing ? 'Syncing…' : 'Sync Now'}</span>
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search emails…"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          <Filter size={13} className="text-muted-foreground mr-1" />
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <f.icon size={12} />
              {f.label}
              {f.count !== undefined && (
                <span className="tabular-nums opacity-70">({f.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Email list */}
      {loading ? (
        <Card className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </Card>
      ) : emails.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
          <Inbox
            size={36}
            className="text-muted-foreground/30 mb-5"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            {search
              ? `No emails matching "${search}"`
              : filter === 'unread'
                ? 'No unread emails — you\'re all caught up!'
                : filter === 'starred'
                  ? 'No starred emails'
                  : 'No emails synced yet. Click Sync Now to fetch your latest emails.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-2">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <Card className="divide-y divide-border">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => router.push(`/inbox/${email.id}`)}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/30 cursor-pointer',
                  !email.isRead && 'bg-primary/[0.02]',
                )}
              >
                {/* Indicators */}
                <div className="mt-2 flex shrink-0 items-center gap-1.5">
                  {!email.isRead ? (
                    <span
                      className="h-2 w-2 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  ) : (
                    <span className="h-2 w-2" />
                  )}
                  {email.isStarred && (
                    <Star
                      size={12}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        'truncate text-sm',
                        !email.isRead
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-foreground/80',
                      )}
                    >
                      {email.senderName || email.senderEmail}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(email.receivedAt)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'truncate text-sm mt-0.5',
                      !email.isRead
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {email.subject}
                  </p>

                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {email.snippet}
                  </p>
                  
                  {/* Category and Action Badges */}
                  {(email.category || email.actionRequired) && (
                    <div className="flex items-center gap-2 mt-2">
                      {email.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {getCategoryDisplayName(email.category)}
                        </span>
                      )}
                      {email.actionRequired && email.actionRequired !== 'Ignore' && email.actionRequired !== 'Read Later' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                          {email.actionRequired}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={14} />
                <span className="ml-1">Previous</span>
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                <span className="mr-1">Next</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
