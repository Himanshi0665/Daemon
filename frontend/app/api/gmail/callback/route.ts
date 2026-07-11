/**
 * GET /api/gmail/callback
 *
 * Handles the redirect back from Google after the user consents:
 *   1. Verifies the Clerk session is still active.
 *   2. Validates the CSRF state cookie.
 *   3. Exchanges the authorization code for access + refresh tokens.
 *   4. Fetches the Gmail address from the Gmail API.
 *   5. Encrypts and stores the tokens in the GmailAccount table.
 *   6. Clears the state cookie and redirects to the dashboard.
 *
 * All error paths redirect to /dashboard with an ?error= param
 * instead of returning error responses, so the user always ends up
 * back in the app.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exchangeCode } from '@backend/integrations/gmail/client'
import { upsertGmailAccount } from '@backend/repositories/gmailAccount.repository'

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin

  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(`${origin}/sign-in`)
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Helper: redirect to dashboard with an error query param, always clearing the cookie
  const failRedirect = (reason: string) => {
    const url = new URL('/dashboard', origin)
    url.searchParams.set('error', reason)
    const res = NextResponse.redirect(url)
    res.cookies.delete('oauth_state')
    return res
  }

  // User clicked "Deny" on the Google consent screen
  if (error) {
    console.warn('[gmail/callback] Google OAuth error:', error)
    return failRedirect('oauth_denied')
  }

  if (!code || !state) {
    return failRedirect('oauth_invalid_params')
  }

  // ── CSRF check ──────────────────────────────────────────────────────────────
  const storedState = request.cookies.get('oauth_state')?.value
  if (!storedState || storedState !== state) {
    console.error('[gmail/callback] State mismatch — possible CSRF attack')
    return failRedirect('oauth_state_mismatch')
  }

  // ── Token exchange ───────────────────────────────────────────────────────────
  try {
    const { accessToken, refreshToken, expiresAt, gmailEmail } =
      await exchangeCode(code)

    await upsertGmailAccount({
      userId,
      gmailEmail,
      accessToken,
      refreshToken,
      expiresAt,
    })

    // Success — redirect to dashboard with a flag the UI can use
    const successUrl = new URL('/dashboard', origin)
    successUrl.searchParams.set('connected', 'true')
    const res = NextResponse.redirect(successUrl)
    res.cookies.delete('oauth_state')
    return res

  } catch (err) {
    console.error('[gmail/callback] Token exchange / DB write failed:', err)
    return failRedirect('oauth_failed')
  }
}
