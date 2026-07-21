/**
 * SyncedEmail repository.
 *
 * Handles bulk upserts (deduplication by userId + messageId),
 * paginated reads with search/filter, and aggregate stats for the dashboard.
 */
import { db } from '@backend/utils/db'
import type { ParsedEmail } from '@backend/integrations/gmail/messages'
import type { Prisma } from '@prisma/client'

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Upserts a batch of parsed emails into the database.
 * Uses the @@unique([userId, messageId]) constraint to prevent duplicates.
 * Returns the number of successfully upserted rows.
 */
export async function upsertEmails(
  userId: string,
  emails: ParsedEmail[],
): Promise<number> {
  let count = 0

  // Process in smaller batches sequentially to avoid connection pool exhaustion (Neon P1017)
  const BATCH = 10

  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)

    // Execute concurrently but NOT in a single massive transaction
    await Promise.all(
      batch.map(async (email) => {
        let retries = 3
        while (retries > 0) {
          try {
            await db.syncedEmail.upsert({
              where: {
                userId_messageId: {
                  userId,
                  messageId: email.messageId,
                },
              },
              create: {
                userId,
                messageId: email.messageId,
                threadId: email.threadId,
                historyId: email.historyId ?? null,
                senderName: email.senderName,
                senderEmail: email.senderEmail,
                subject: email.subject,
                snippet: email.snippet,
                receivedAt: email.receivedAt,
                internalDate: email.internalDate,
                labels: email.labels,
                isRead: email.isRead,
                isStarred: email.isStarred,
                bodyText: email.bodyText,
                bodyHtml: email.bodyHtml,
              },
              update: {
                labels: email.labels,
                isRead: email.isRead,
                isStarred: email.isStarred,
                snippet: email.snippet,
              },
            })
            break // success
          } catch (error: any) {
            retries--
            if (retries === 0) {
              console.error(`[upsertEmails] Failed to upsert ${email.messageId} after retries:`, error)
            } else {
              const delay = Math.pow(2, 3 - retries) * 500
              console.warn(`[upsertEmails] Upsert failed for ${email.messageId}, retrying in ${delay}ms...`)
              await new Promise(res => setTimeout(res, delay))
            }
          }
        }
      })
    )

    count += batch.length
  }

  return count
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export type EmailFilter = {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  starredOnly?: boolean
  search?: string
  label?: string
}

/**
 * Returns paginated emails for a user with optional filters.
 * Supports search across subject, sender, and snippet.
 */
export async function getEmailsByUser(
  userId: string,
  params: EmailFilter = {},
) {
  const {
    limit = 30,
    offset = 0,
    unreadOnly = false,
    starredOnly = false,
    search,
    label,
  } = params

  const where: Prisma.SyncedEmailWhereInput = {
    userId,
    ...(unreadOnly && { isRead: false }),
    ...(starredOnly && { isStarred: true }),
    ...(label && { labels: { has: label } }),
    ...(search && {
      OR: [
        { subject: { contains: search, mode: 'insensitive' as const } },
        { senderEmail: { contains: search, mode: 'insensitive' as const } },
        { senderName: { contains: search, mode: 'insensitive' as const } },
        { snippet: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const emails = await db.syncedEmail.findMany({
    where,
    orderBy: { receivedAt: 'desc' },
    take: limit,
    skip: offset,
    distinct: ['threadId'],
    select: {
      id: true,
      messageId: true,
      threadId: true,
      senderName: true,
      senderEmail: true,
      subject: true,
      snippet: true,
      receivedAt: true,
      labels: true,
      isRead: true,
      isStarred: true,
    },
  })

  // Fetch associated Items for categorization and actions
  const items = await db.item.findMany({
    where: { gmailMessageId: { in: emails.map(e => e.messageId) } },
    select: { gmailMessageId: true, category: true, actionRequired: true }
  })
  
  const itemMap = new Map(items.map(i => [i.gmailMessageId, i]))

  const emailsWithItems = emails.map(e => {
    const item = itemMap.get(e.messageId)
    return {
      ...e,
      category: item?.category,
      actionRequired: item?.actionRequired
    }
  })

  const totalGroups = await db.syncedEmail.groupBy({
    by: ['threadId'],
    where,
  })

  const total = totalGroups.length

  return {
    emails: emailsWithItems,
    total,
    hasMore: offset + limit < total,
  }
}

/**
 * Returns aggregate stats for the dashboard.
 */
export async function getEmailStats(userId: string) {
  const totalGroups = await db.syncedEmail.groupBy({ by: ['threadId'], where: { userId } })
  const unreadGroups = await db.syncedEmail.groupBy({ by: ['threadId'], where: { userId, isRead: false } })
  const starredGroups = await db.syncedEmail.groupBy({ by: ['threadId'], where: { userId, isStarred: true } })

  return {
    total: totalGroups.length,
    unread: unreadGroups.length,
    starred: starredGroups.length,
  }
}

/**
 * Returns the top senders by email count.
 */
export async function getTopSenders(userId: string, limit = 5) {
  const result = await db.syncedEmail.groupBy({
    by: ['senderEmail', 'senderName'],
    where: { userId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  })

  return result.map((r) => ({
    email: r.senderEmail,
    name: r.senderName,
    count: r._count.id,
  }))
}

/**
 * Deletes all synced emails for a user.
 * Called when the user disconnects Gmail.
 */
export async function deleteAllEmails(userId: string): Promise<void> {
  await db.syncedEmail.deleteMany({ where: { userId } })
}
