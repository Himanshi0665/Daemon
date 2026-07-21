import { NextResponse } from 'next/server'
import { db } from '@backend/utils/db'
import { requireUserByClerkId } from '@backend/utils/auth'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await requireUserByClerkId(clerkId)
    const { id } = await params

    const email = await db.syncedEmail.findFirst({
      where: {
        id,
        userId: user.id, // Security: ensure user owns the email
      },
    })

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // Optionally mark as read when fetching full details
    if (!email.isRead) {
      await db.syncedEmail.update({
        where: { id },
        data: {
          isRead: true,
          // We also need to remove UNREAD from labels array
          labels: email.labels.filter(l => l !== 'UNREAD')
        }
      })
      email.isRead = true
    }

    return NextResponse.json({ email })
  } catch (error) {
    console.error('[API] /api/emails/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
