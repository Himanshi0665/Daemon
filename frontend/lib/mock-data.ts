/**
 * All placeholder/mock data for Phase 2 dashboard.
 *
 * How to use:
 * - Default exports show the "empty" state (Gmail not connected, no items).
 * - The `*Populated` exports show a realistic connected state for UI testing.
 * - To switch: change the import in each component.
 *
 * Replace with real API calls starting Phase 3.
 * All types mirror the Prisma schema exactly.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
// Inline types (no Prisma import) so this file works before `prisma generate`.

export type ItemCategory =
  | 'INTERVIEW'
  | 'ONLINE_ASSESSMENT'
  | 'ASSIGNMENT'
  | 'DEADLINE'
  | 'MEETING'
  | 'RECRUITER'
  | 'FORM'
  | 'OFFER'
  | 'REJECTION'
  | 'PERSONAL'
  | 'GENERAL'

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString()
}

function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString()
}

// ─── Daemon Status ────────────────────────────────────────────────────────────

export type DaemonStatus = {
  gmailConnected: boolean
  gmailEmail: string | null
  lastScanAt: string | null       // ISO 8601
  emailsProcessedToday: number
  scanFrequencyMins: number
}

/**
 * Default: Gmail not connected.
 * Swap with mockDaemonStatusConnected to test the connected UI.
 */
export const mockDaemonStatus: DaemonStatus = {
  gmailConnected: false,
  gmailEmail: null,
  lastScanAt: null,
  emailsProcessedToday: 0,
  scanFrequencyMins: 30,
}

/** Connected state for UI testing. */
export const mockDaemonStatusConnected: DaemonStatus = {
  gmailConnected: true,
  gmailEmail: 'you@gmail.com',
  lastScanAt: hoursFromNow(-0.3),  // ~18 min ago
  emailsProcessedToday: 0,
  scanFrequencyMins: 30,
}

// ─── Critical Item ────────────────────────────────────────────────────────────

export type MockCriticalItem = {
  id: string
  company: string | null
  title: string
  category: ItemCategory
  priority: Priority
  deadline: string | null          // ISO 8601
}

/**
 * Default: no critical items (shows empty state).
 * Swap with mockCriticalItemPopulated to test the critical UI.
 */
export const mockCriticalItem: MockCriticalItem | null = null

/** Critical item for UI testing. */
export const mockCriticalItemPopulated: MockCriticalItem = {
  id: 'mock-critical-1',
  company: 'Google',
  title: 'Online Assessment',
  category: 'ONLINE_ASSESSMENT',
  priority: 'CRITICAL',
  deadline: hoursFromNow(3),
}

// ─── Today's Focus ────────────────────────────────────────────────────────────

export type FocusItem = {
  id: string
  label: string
  category: ItemCategory
  time: string | null              // e.g. "5:00 PM"
  isDone: boolean
}

/** Default: no focus items. */
export const mockTodaysFocus: FocusItem[] = []

/** Populated focus list for UI testing. */
export const mockTodaysFocusPopulated: FocusItem[] = [
  {
    id: 'f1',
    label: 'Amazon Online Assessment',
    category: 'ONLINE_ASSESSMENT',
    time: null,
    isDone: false,
  },
  {
    id: 'f2',
    label: 'Goldman Sachs Application Form',
    category: 'FORM',
    time: null,
    isDone: false,
  },
  {
    id: 'f3',
    label: 'Google Meet',
    category: 'MEETING',
    time: '5:00 PM',
    isDone: false,
  },
  {
    id: 'f4',
    label: 'Microsoft HR Reply',
    category: 'RECRUITER',
    time: null,
    isDone: true,
  },
]

// ─── Inbox Intelligence ───────────────────────────────────────────────────────

export type InboxStats = {
  importantEmails: number
  hiddenPromotions: number
  unreadActionable: number
  lastScanAt: string | null
}

/** Default: no scan run yet. */
export const mockInboxStats: InboxStats = {
  importantEmails: 0,
  hiddenPromotions: 0,
  unreadActionable: 0,
  lastScanAt: null,
}

/** Populated inbox stats for UI testing. */
export const mockInboxStatsPopulated: InboxStats = {
  importantEmails: 7,
  hiddenPromotions: 23,
  unreadActionable: 4,
  lastScanAt: hoursFromNow(-0.3),
}

// ─── AI Daily Summary ─────────────────────────────────────────────────────────

/**
 * Default: null = Gemini hasn't run yet (shows placeholder UI).
 * Swap with mockAISummaryPopulated to test the summary card.
 */
export const mockAISummary: string | null = null

/** AI summary for UI testing. */
export const mockAISummaryPopulated =
  'You have 2 deadlines this week and 1 interview tomorrow. The Goldman Sachs application form closes in 3 days — submit before 11:59 PM.'

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineItem = {
  id: string
  company: string | null
  title: string
  category: ItemCategory
  date: string                     // ISO 8601
  eventTime: string | null
  meetingLink: string | null
}

/** Default: no items (shows empty state). */
export const mockTimelineItems: TimelineItem[] = []

/** Populated timeline for UI testing. */
export const mockTimelineItemsPopulated: TimelineItem[] = [
  {
    id: 't1',
    company: 'Amazon',
    title: 'Online Assessment Deadline',
    category: 'ONLINE_ASSESSMENT',
    date: daysFromNow(1),
    eventTime: null,
    meetingLink: null,
  },
  {
    id: 't2',
    company: 'Google',
    title: 'Final Round Interview',
    category: 'INTERVIEW',
    date: daysFromNow(2),
    eventTime: '2:00 PM',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
  },
  {
    id: 't3',
    company: 'Goldman Sachs',
    title: 'Application Form Deadline',
    category: 'FORM',
    date: daysFromNow(3),
    eventTime: null,
    meetingLink: null,
  },
  {
    id: 't4',
    company: 'Microsoft',
    title: 'HR Screening Call',
    category: 'INTERVIEW',
    date: daysFromNow(5),
    eventTime: '11:00 AM',
    meetingLink: null,
  },
  {
    id: 't5',
    company: 'Stripe',
    title: 'Take-Home Assignment Due',
    category: 'ASSIGNMENT',
    date: daysFromNow(7),
    eventTime: null,
    meetingLink: null,
  },
]
