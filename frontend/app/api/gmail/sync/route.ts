import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getValidAccessToken } from '@backend/integrations/gmail/tokens'
import { listMessageIds, fetchMessages } from '@backend/integrations/gmail/messages'
import { upsertEmails, getEmailStats } from '@backend/repositories/syncedEmail.repository'
import { upsertSyncState, getSyncState } from '@backend/repositories/emailSyncState.repository'

export const maxDuration = 300 // allow up to 5 mins

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let user
  try {
    user = await requireUserByClerkId(clerkId)
  } catch {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
  }

  // Get a valid access token (auto-refreshes if needed)
  const tokenResult = await getValidAccessToken(user.id)

  if (!tokenResult) {
    return NextResponse.json(
      { error: 'Gmail not connected or token revoked. Please reconnect.' },
      { status: 403 },
    )
  }

  try {
    // 1. Get current sync state
    const syncState = await getSyncState(user.id)
    
    // We only fetch one large chunk (e.g., 200 emails) per API request to prevent timeouts
    // The frontend will keep calling this endpoint while `hasMore: true`
    const MAX_RESULTS_PER_REQUEST = 200 
    
    const pageToken = syncState?.nextPageToken ?? undefined

    const result = await listMessageIds(tokenResult.accessToken, {
      maxResults: MAX_RESULTS_PER_REQUEST,
      pageToken,
    })

    if (result.ids.length === 0) {
      const stats = await getEmailStats(user.id)
      
      // If we finished syncing, clear the nextPageToken
      if (syncState?.nextPageToken) {
        await upsertSyncState(user.id, {
          nextPageToken: null,
          totalSynced: stats.total,
        })
      }
      
      return NextResponse.json({
        synced: 0,
        total: stats.total,
        unread: stats.unread,
        hasMore: false,
        message: 'No new emails to sync',
      })
    }

    // 1.5 Optimization: if all message IDs are already in the DB, we reached the end of new emails!
    const { db } = await import('@backend/utils/db')
    const existingCount = await db.syncedEmail.count({
      where: {
        userId: user.id,
        messageId: { in: result.ids.map(i => i.id) }
      }
    })

    const allExisting = existingCount === result.ids.length && result.ids.length > 0

    // 2. Fetch full message details in batches
    const parsedEmails = await fetchMessages(tokenResult.accessToken, result.ids)

    // 3. Store in database (deduplicates via unique constraint)
    await upsertEmails(user.id, parsedEmails)

    // 4. Update sync state
    const stats = await getEmailStats(user.id)
    const latestHistoryId = parsedEmails
      .map((e) => e.historyId)
      .filter(Boolean)
      .sort()
      .pop()

    // Determine if we should keep going
    // If all existing, we assume we've hit the boundary of already-synced emails.
    const hasMore = !!result.nextPageToken && !allExisting
    
    // If there is no next page token OR we hit the boundary, we save null to finish sync.
    await upsertSyncState(user.id, {
      lastHistoryId: latestHistoryId ?? syncState?.lastHistoryId,
      nextPageToken: hasMore ? result.nextPageToken : null,
      totalSynced: stats.total,
    })

    // Trigger background AI scan (non-blocking)
    try {
      fetch(`${request.nextUrl.origin}/api/ai/scan`, { method: 'POST' }).catch(() => {})
    } catch (_) {}

    return NextResponse.json({
      synced: parsedEmails.length,
      total: stats.total,
      unread: stats.unread,
      hasMore,
      message: `Synced ${parsedEmails.length} emails`,
    })

  } catch (err) {
    console.error('[gmail/sync] Sync failed:', err)
    return NextResponse.json(
      { error: 'Sync failed. Please try again.' },
      { status: 500 },
    )
  }
}
