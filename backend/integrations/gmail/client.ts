/**
 * Google OAuth2 client helpers.
 *
 * All functions are pure — they create a fresh client each call so
 * there are no shared-state bugs across concurrent requests.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI   e.g. http://localhost:3000/api/gmail/callback
 */
import { google } from 'googleapis'

const SCOPES = [
  // Read-only access — no send, no modify, no delete
  'https://www.googleapis.com/auth/gmail.readonly',
]

function createClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI',
    )
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

/**
 * Returns the Google consent screen URL.
 * `state` is echoed back by Google in the callback for CSRF validation.
 */
export function generateAuthUrl(state: string): string {
  const client = createClient()
  return client.generateAuthUrl({
    access_type: 'offline',  // Required to get a refresh_token
    scope: SCOPES,
    state,
    prompt: 'consent',       // Always show consent — guarantees refresh_token is returned
  })
}

/**
 * Exchanges the authorization code for tokens, then fetches the user's
 * Gmail address from the Gmail API.
 *
 * Returns typed token + email data — never exposes raw Google token objects.
 */
export async function exchangeCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
  gmailEmail: string
}> {
  const client = createClient()
  const { tokens } = await client.getToken(code)

  if (!tokens.access_token) {
    throw new Error('OAuth exchange did not return an access_token')
  }
  if (!tokens.refresh_token) {
    throw new Error(
      'OAuth exchange did not return a refresh_token. ' +
        'Ensure prompt=consent and the user has not previously connected.',
    )
  }

  // Use the access token immediately to fetch the Gmail address
  client.setCredentials(tokens)
  const gmail = google.gmail({ version: 'v1', auth: client })
  const profile = await gmail.users.getProfile({ userId: 'me' })
  const gmailEmail = profile.data.emailAddress

  if (!gmailEmail) {
    throw new Error('Gmail profile returned no emailAddress')
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3_600_000),
    gmailEmail,
  }
}

/**
 * Revokes a token with Google (best-effort — does not throw on failure).
 * Call before deleting the GmailAccount row to clean up on Google's side.
 */
export async function revokeToken(token: string): Promise<void> {
  const client = createClient()
  await client.revokeToken(token)
}

/**
 * Returns a fully-authenticated OAuth2 client for a known access token.
 * Used by Phase 3B+ for Gmail API calls.
 */
export function getAuthenticatedClient(accessToken: string) {
  const client = createClient()
  client.setCredentials({ access_token: accessToken })
  return client
}
