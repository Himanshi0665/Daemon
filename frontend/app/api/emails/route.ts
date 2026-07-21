/**
 * GET /api/emails
 *
 * Returns paginated synced emails for the authenticated user.
 *
 * Query params:
 *   limit    — number of emails to return (default 30, max 100)
 *   offset   — pagination offset (default 0)
 *   unread   — if "true", only return unread emails
 *   starred  — if "true", only return starred emails
 *   search   — search query (matches subject, sender, snippet)
 *   label    — Gmail label to filter by (e.g. "IMPORTANT")
 */
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getEmailsByUser } from '@backend/repositories/syncedEmail.repository'

export async function GET(request: NextRequest) {
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

  const { searchParams } = request.nextUrl
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)
  const unreadOnly = searchParams.get('unread') === 'true'
  const starredOnly = searchParams.get('starred') === 'true'
  const search = searchParams.get('search') || undefined
  const label = searchParams.get('label') || undefined

  const result = await getEmailsByUser(user.id, {
    limit,
    offset,
    unreadOnly,
    starredOnly,
    search,
    label,
  })

  return NextResponse.json(result)
}
