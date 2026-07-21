/**
 * EmailSyncState repository.
 *
 * Tracks the sync cursor and stats per user.
 * Used to show "Last sync: 5 min ago" and "87 emails synced" in the UI.
 */
import { db } from '@backend/utils/db'

/**
 * Creates or updates the sync state for a user after a successful sync.
 */
export async function upsertSyncState(
  userId: string,
  params: {
    lastHistoryId?: string | null
    nextPageToken?: string | null
    isSyncing?: boolean
    totalSynced: number
  },
): Promise<void> {
  await db.emailSyncState.upsert({
    where: { userId },
    create: {
      userId,
      lastSyncAt: new Date(),
      lastHistoryId: params.lastHistoryId ?? null,
      nextPageToken: params.nextPageToken ?? null,
      isSyncing: params.isSyncing ?? false,
      totalSynced: params.totalSynced,
    },
    update: {
      lastSyncAt: new Date(),
      lastHistoryId: params.lastHistoryId !== undefined ? params.lastHistoryId : undefined,
      nextPageToken: params.nextPageToken !== undefined ? params.nextPageToken : undefined,
      isSyncing: params.isSyncing !== undefined ? params.isSyncing : undefined,
      totalSynced: params.totalSynced,
    },
  })
}

/**
 * Returns the sync state for a user, or null if they've never synced.
 */
export async function getSyncState(userId: string) {
  return db.emailSyncState.findUnique({ where: { userId } })
}

/**
 * Deletes the sync state for a user.
 * Called when the user disconnects Gmail.
 */
export async function deleteSyncState(userId: string): Promise<void> {
  await db.emailSyncState
    .delete({ where: { userId } })
    .catch(() => {
      // Row didn't exist — that's fine
    })
}
