/**
 * GET /api/gmail/connect
 *
 * Initiates the Google OAuth flow:
 *   1. Verifies the user is signed in via Clerk.
 *   2. Generates a random state token for CSRF protection.
 *   3. Stores the state in a short-lived httpOnly cookie.
 *   4. Redirects the browser to Google's consent screen.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateAuthUrl } from '@backend/integrations/gmail/client'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  // Guard: user must be authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.nextUrl.origin)
    return NextResponse.redirect(signInUrl)
  }

  // Generate a random, unguessable state value for CSRF protection
  const state = crypto.randomBytes(16).toString('hex')

  let authUrl: string
  try {
    authUrl = generateAuthUrl(state)
  } catch (err) {
    console.error('[gmail/connect] Failed to generate auth URL:', err)
    const errorUrl = new URL('/dashboard', request.nextUrl.origin)
    errorUrl.searchParams.set('error', 'gmail_config_missing')
    return NextResponse.redirect(errorUrl)
  }

  // Store state in a short-lived httpOnly cookie
  // (cannot be read by client JS — protects against XSS)
  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
