/**
 * Category display utilities.
 * All styles use CSS theme variables — no hardcoded colors.
 *
 * Three visual tiers:
 *  urgent  → text-destructive (red)     — time-sensitive items
 *  active  → text-foreground             — action required
 *  passive → text-muted-foreground       — informational
 */

import type { ItemCategory } from '@/lib/mock-data'

export { type ItemCategory }

type CategoryMeta = {
  label: string
  shortLabel: string
  textClass: string
}

export const CATEGORY_META: Record<ItemCategory, CategoryMeta> = {
  INTERVIEW: {
    label: 'Interview',
    shortLabel: 'Interview',
    textClass: 'text-foreground',
  },
  ONLINE_ASSESSMENT: {
    label: 'Online Assessment',
    shortLabel: 'OA',
    textClass: 'text-destructive',
  },
  DEADLINE: {
    label: 'Deadline',
    shortLabel: 'Deadline',
    textClass: 'text-destructive',
  },
  OFFER: {
    label: 'Offer',
    shortLabel: 'Offer',
    textClass: 'text-foreground',
  },
  MEETING: {
    label: 'Meeting',
    shortLabel: 'Meeting',
    textClass: 'text-foreground',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    shortLabel: 'Assignment',
    textClass: 'text-foreground',
  },
  FORM: {
    label: 'Form',
    shortLabel: 'Form',
    textClass: 'text-muted-foreground',
  },
  RECRUITER: {
    label: 'Recruiter',
    shortLabel: 'Recruiter',
    textClass: 'text-muted-foreground',
  },
  REJECTION: {
    label: 'Rejection',
    shortLabel: 'Rejection',
    textClass: 'text-muted-foreground',
  },
  PERSONAL: {
    label: 'Personal',
    shortLabel: 'Personal',
    textClass: 'text-muted-foreground',
  },
  GENERAL: {
    label: 'General',
    shortLabel: 'General',
    textClass: 'text-muted-foreground',
  },
}

export function getCategoryMeta(category: ItemCategory): CategoryMeta {
  return CATEGORY_META[category]
}
