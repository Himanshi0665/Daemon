/**
 * DELETE /api/gmail/disconnect
 *
 * Disconnects Gmail:
 *   1. Revokes the token with Google (best-effort).
 *   2. Deletes all synced emails for this user.
 *   3. Deletes the sync state.
 *   4. Deletes the GmailAccount row.
 */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getDecryptedTokens, deleteGmailAccount } from '@backend/repositories/gmailAccount.repository'
import { deleteAllEmails } from '@backend/repositories/syncedEmail.repository'
import { deleteSyncState } from '@backend/repositories/emailSyncState.repository'
import { revokeToken } from '@backend/integrations/gmail/client'

export async function DELETE() {
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

  // Get the token to revoke with Google (best-effort)
  const account = await getDecryptedTokens(user.id)
  if (account) {
    try {
      await revokeToken(account.accessToken)
    } catch {
      // Best-effort — don't fail if Google rejects the revoke
      console.warn('[gmail/disconnect] Token revocation failed — continuing')
    }
  }

  // Delete all user data in order (emails → sync state → account)
  await deleteAllEmails(user.id)
  await deleteSyncState(user.id)
  await deleteGmailAccount(user.id)

  return NextResponse.json({ disconnected: true })
}
