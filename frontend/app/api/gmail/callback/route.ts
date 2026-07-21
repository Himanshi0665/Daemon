/**
 * GET /api/gmail/callback
 *
 * Handles the redirect back from Google after the user consents:
 *   1. Verifies the Clerk session is still active.
 *   2. Validates the CSRF state cookie.
 *   3. Exchanges the authorization code for access + refresh tokens.
 *   4. Resolves Clerk userId → Prisma User.id (CRITICAL).
 *   5. Encrypts and stores the tokens in the GmailAccount table.
 *   6. Clears the state cookie and redirects to the dashboard.
 *
 * All error paths redirect to /dashboard with an ?error= param
 * so the user always ends up back in the app.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exchangeCode } from '@backend/integrations/gmail/client'
import { upsertGmailAccount } from '@backend/repositories/gmailAccount.repository'
import { requireUserByClerkId } from '@backend/utils/auth'

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin

  const { userId: clerkId } = await auth()

  if (!clerkId) {
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

  // ── Resolve Clerk ID → Prisma User ID ────────────────────────────────────────
  let prismaUserId: string
  try {
    const user = await requireUserByClerkId(clerkId)
    prismaUserId = user.id
  } catch (err) {
    console.error('[gmail/callback] Could not resolve Clerk user to DB user:', err)
    return failRedirect('user_not_found')
  }

  // ── Token exchange ───────────────────────────────────────────────────────────
  try {
    const { accessToken, refreshToken, expiresAt, gmailEmail } =
      await exchangeCode(code)

    await upsertGmailAccount({
      userId: prismaUserId, // Use the PRISMA user ID, not the Clerk ID
      gmailEmail,
      accessToken,
      refreshToken,
      expiresAt,
    })

    // Success — redirect to dashboard
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
