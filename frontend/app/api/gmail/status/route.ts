/**
 * GET /api/gmail/status
 *
 * Returns the Gmail connection status and sync stats for the current user.
 * Used by the dashboard to decide what to render.
 */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getGmailAccount } from '@backend/repositories/gmailAccount.repository'
import { getSyncState } from '@backend/repositories/emailSyncState.repository'
import { getEmailStats } from '@backend/repositories/syncedEmail.repository'

export async function GET() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let user
  try {
    user = await requireUserByClerkId(clerkId)
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const gmailAccount = await getGmailAccount(user.id)

  if (!gmailAccount) {
    return NextResponse.json({
      connected: false,
      gmailEmail: null,
      isActive: false,
      lastSyncAt: null,
      totalSynced: 0,
      unreadCount: 0,
    })
  }

  const [syncState, emailStats] = await Promise.all([
    getSyncState(user.id),
    getEmailStats(user.id),
  ])

  return NextResponse.json({
    connected: true,
    gmailEmail: gmailAccount.gmailAddress,
    isActive: gmailAccount.isActive,
    lastSyncAt: syncState?.lastSyncAt?.toISOString() ?? null,
    totalSynced: emailStats.total,
    unreadCount: emailStats.unread,
  })
}
