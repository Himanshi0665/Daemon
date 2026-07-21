import { db } from '@backend/utils/db'
import { ItemCategory, ItemStatus, Priority } from '@prisma/client'

export async function getCriticalToday(userId: string) {
  // Find CRITICAL priority items with pending/in_progress status
  return db.item.findMany({
    where: {
      userId,
      priority: Priority.CRITICAL,
      status: { in: [ItemStatus.PENDING, ItemStatus.IN_PROGRESS] }
    },
    orderBy: { deadline: 'asc' },
    take: 3
  })
}

export async function getTodaysFocus(userId: string) {
  return db.item.findMany({
    where: {
      userId,
      priority: { in: [Priority.HIGH, Priority.MEDIUM] },
      status: { in: [ItemStatus.PENDING, ItemStatus.IN_PROGRESS] }
    },
    orderBy: { priority: 'asc' },
    take: 5
  })
}

export async function getUpcomingItems(userId: string) {
  return db.item.findMany({
    where: {
      userId,
      deadline: { not: null },
      status: { in: [ItemStatus.PENDING, ItemStatus.IN_PROGRESS] }
    },
    orderBy: { deadline: 'asc' },
    take: 5
  })
}

export async function getInboxIntelligenceStats(userId: string) {
  // Group items by category to populate the intelligence dashboard
  const stats = await db.item.groupBy({
    by: ['category'],
    where: { userId },
    _count: { id: true },
  })

  return stats.map(s => ({ category: s.category, count: s._count.id }))
}

export async function getActionableCount(userId: string) {
  return db.item.count({
    where: {
      userId,
      isActionable: true,
      actionRequired: { not: null, notIn: ['Ignore', 'Read Later'] }
    }
  })
}
