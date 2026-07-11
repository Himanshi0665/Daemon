/**
 * GmailAccount repository.
 *
 * All token I/O goes through this file — tokens are always encrypted at rest
 * and always decrypted on the way out. Nothing outside this file should
 * touch raw (plaintext) token strings.
 */
import { db } from '@backend/utils/db'
import { encrypt, decrypt } from '@backend/utils/encryption'

// ─── Types ────────────────────────────────────────────────────────────────────

export type GmailAccountRow = {
  id: string
  userId: string
  gmailAddress: string
  tokenExpiresAt: Date
  lastSyncAt: Date | null
  historyId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type DecryptedGmailAccount = GmailAccountRow & {
  accessToken: string
  refreshToken: string
}

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Creates or updates the GmailAccount for a user.
 * Encrypts both tokens before writing to DB.
 */
export async function upsertGmailAccount(params: {
  userId: string
  gmailEmail: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
}): Promise<GmailAccountRow> {
  const encAccessToken = encrypt(params.accessToken)
  const encRefreshToken = encrypt(params.refreshToken)

  return db.gmailAccount.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      gmailAddress: params.gmailEmail,
      accessToken: encAccessToken,
      refreshToken: encRefreshToken,
      tokenExpiresAt: params.expiresAt,
      isActive: true,
    },
    update: {
      gmailAddress: params.gmailEmail,
      accessToken: encAccessToken,
      refreshToken: encRefreshToken,
      tokenExpiresAt: params.expiresAt,
      isActive: true,
    },
    // Return only the non-sensitive columns to the caller
    select: {
      id: true,
      userId: true,
      gmailAddress: true,
      tokenExpiresAt: true,
      lastSyncAt: true,
      historyId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Updates sync metadata after a successful scan.
 * Called by Phase 3B after each sync run.
 */
export async function updateSyncState(
  userId: string,
  params: { lastSyncAt: Date; historyId?: string },
): Promise<void> {
  await db.gmailAccount.update({
    where: { userId },
    data: {
      lastSyncAt: params.lastSyncAt,
      ...(params.historyId !== undefined && { historyId: params.historyId }),
    },
  })
}

/**
 * Marks the account as inactive when the refresh token is revoked.
 * The row stays in DB so the user sees a "reconnect" prompt.
 */
export async function setGmailAccountInactive(userId: string): Promise<void> {
  await db.gmailAccount.update({
    where: { userId },
    data: { isActive: false },
  })
}

/**
 * Deletes the GmailAccount row.
 * Swallows the error if no row exists (idempotent).
 */
export async function deleteGmailAccount(userId: string): Promise<void> {
  await db.gmailAccount
    .delete({ where: { userId } })
    .catch(() => {
      // Row didn't exist — that's fine
    })
}

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * Returns the GmailAccount row without tokens.
 * Safe to use anywhere — tokens are not included.
 */
export async function getGmailAccount(
  userId: string,
): Promise<GmailAccountRow | null> {
  return db.gmailAccount.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      gmailAddress: true,
      tokenExpiresAt: true,
      lastSyncAt: true,
      historyId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Returns the GmailAccount with DECRYPTED tokens.
 * Use only in server-side services that need to make Gmail API calls.
 * Never send the return value to the client.
 */
export async function getDecryptedTokens(
  userId: string,
): Promise<DecryptedGmailAccount | null> {
  const row = await db.gmailAccount.findUnique({ where: { userId } })
  if (!row) return null

  try {
    return {
      id: row.id,
      userId: row.userId,
      gmailAddress: row.gmailAddress,
      tokenExpiresAt: row.tokenExpiresAt,
      lastSyncAt: row.lastSyncAt,
      historyId: row.historyId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      accessToken: decrypt(row.accessToken),
      refreshToken: decrypt(row.refreshToken),
    }
  } catch (err) {
    console.error('[gmailAccount.repository] Token decryption failed:', err)
    return null
  }
}
