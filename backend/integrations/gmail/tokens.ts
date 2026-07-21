/**
 * Gmail token management — refresh expired tokens automatically.
 *
 * Tokens are stored encrypted in the DB. This module:
 *   1. Decrypts the stored tokens.
 *   2. Checks if the access token is expired or near-expiry.
 *   3. Uses the refresh token to get a new access token from Google.
 *   4. Re-encrypts and stores the new access token.
 *   5. Returns a valid access token for immediate use.
 *
 * If the refresh token has been revoked by Google (user removed access),
 * we mark the GmailAccount as inactive so the UI shows a reconnect prompt.
 */
import { google } from 'googleapis'
import { db } from '@backend/utils/db'
import { encrypt, decrypt } from '@backend/utils/encryption'
import { getDecryptedTokens, setGmailAccountInactive } from '@backend/repositories/gmailAccount.repository'

const EXPIRY_BUFFER_MS = 5 * 60 * 1000 // Refresh 5 minutes before expiry

/**
 * Returns a valid (non-expired) access token for the given user.
 * Automatically refreshes if the stored token is expired or near-expiry.
 *
 * Returns null if:
 * - No GmailAccount exists
 * - Account is inactive
 * - Refresh token has been revoked
 */
export async function getValidAccessToken(
  userId: string,
): Promise<{ accessToken: string; gmailAddress: string } | null> {
  const account = await getDecryptedTokens(userId)

  if (!account) {
    return null
  }

  if (!account.isActive) {
    return null
  }

  // Check if token is still valid (with buffer)
  const now = Date.now()
  const expiresAt = account.tokenExpiresAt.getTime()

  if (expiresAt - now > EXPIRY_BUFFER_MS) {
    // Token is still fresh — use it directly
    return {
      accessToken: account.accessToken,
      gmailAddress: account.gmailAddress,
    }
  }

  // Token is expired or near-expiry — refresh it
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    oauth2Client.setCredentials({
      refresh_token: account.refreshToken,
    })

    const { credentials } = await oauth2Client.refreshAccessToken()

    if (!credentials.access_token) {
      throw new Error('Refresh did not return a new access_token')
    }

    const newExpiresAt = new Date(
      credentials.expiry_date ?? Date.now() + 3_600_000,
    )

    // Re-encrypt and store the new access token
    await db.gmailAccount.update({
      where: { userId },
      data: {
        accessToken: encrypt(credentials.access_token),
        tokenExpiresAt: newExpiresAt,
        // If Google returned a new refresh token (rare), store that too
        ...(credentials.refresh_token && {
          refreshToken: encrypt(credentials.refresh_token),
        }),
      },
    })

    return {
      accessToken: credentials.access_token,
      gmailAddress: account.gmailAddress,
    }

  } catch (err: any) {
    // Google returns invalid_grant when the refresh token has been revoked
    const isRevoked =
      err?.response?.data?.error === 'invalid_grant' ||
      err?.message?.includes('invalid_grant')

    if (isRevoked) {
      console.error('[tokens] Refresh token revoked for user:', userId)
      await setGmailAccountInactive(userId)
      return null
    }

    // Re-throw other errors (network issues, etc.)
    console.error('[tokens] Failed to refresh access token:', err)
    throw err
  }
}
