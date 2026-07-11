/**
 * Date/time formatting utilities for Daemon.
 * All functions handle null/undefined gracefully, returning '—'.
 */

/** Returns a human-readable relative label ("in 3h", "18m ago", "Tomorrow"). */
export function formatRelativeTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = d.getTime() - Date.now()
  const abs = Math.abs(diff)
  const future = diff > 0

  if (abs < 60_000) return 'Just now'
  if (abs < 3_600_000) {
    const m = Math.floor(abs / 60_000)
    return future ? `in ${m}m` : `${m}m ago`
  }
  if (abs < 86_400_000) {
    const h = Math.floor(abs / 3_600_000)
    return future ? `in ${h}h` : `${h}h ago`
  }
  const days = Math.floor(abs / 86_400_000)
  if (days === 1) return future ? 'Tomorrow' : 'Yesterday'
  if (days < 7) return future ? `in ${days} days` : `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Returns a short date string: "Jul 9" */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Returns a time string or '—' for null. */
export function formatTime(time: string | null | undefined): string {
  return time ?? '—'
}

/** Buckets a date into a named timeline group. */
export function getTimelineBucket(
  date: string | Date,
): 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'later' {
  const target = new Date(date)
  const now = new Date()

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const itemDay = startOfDay(target)
  const todayStart = startOfDay(now)
  const DAY = 86_400_000

  if (itemDay === todayStart) return 'today'
  if (itemDay === todayStart + DAY) return 'tomorrow'
  if (itemDay < todayStart + 7 * DAY) return 'this-week'
  if (itemDay < todayStart + 14 * DAY) return 'next-week'
  return 'later'
}
