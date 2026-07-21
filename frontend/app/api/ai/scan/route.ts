import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@backend/utils/db'
import { analyzeEmail } from '@backend/services/ai'
import { requireUserByClerkId } from '@backend/utils/auth'

export const maxDuration = 300

export async function POST(_request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await requireUserByClerkId(clerkId)

  // Find unprocessed emails
  const emails = await db.syncedEmail.findMany({
    where: { userId: user.id, isProcessed: false },
    take: 50, // process in small batches to respect Gemini rate limits
  })

  if (emails.length === 0) {
    return NextResponse.json({ message: 'All caught up' })
  }

  let processed = 0
  let skipped = 0

  for (const email of emails) {
    const analysis = await analyzeEmail({
      subject: email.subject,
      sender: email.senderEmail,
      snippet: email.snippet,
      bodyText: email.bodyText,
      bodyHtml: email.bodyHtml
    })

    if (analysis) {
      // Create the Item
      await db.item.create({
        data: {
          userId: user.id,
          gmailMessageId: email.messageId,
          gmailThreadId: email.threadId,
          subject: email.subject,
          fromEmail: email.senderEmail,
          fromName: email.senderName,
          receivedAt: email.receivedAt,
          category: analysis.category,
          company: analysis.company,
          title: analysis.title,
          description: analysis.description,
          deadline: analysis.deadline ? new Date(analysis.deadline) : null,
          eventDate: analysis.eventDate ? new Date(analysis.eventDate) : null,
          eventTime: analysis.eventTime,
          actionRequired: analysis.actionRequired,
          isActionable: analysis.isActionable,
          priority: analysis.priority,
          confidenceScore: analysis.confidenceScore,
          needsReview: analysis.confidenceScore < 0.7,
        }
      })
      processed++
    } else {
      skipped++
    }

    // Mark as processed
    await db.syncedEmail.update({
      where: { id: email.id },
      data: { isProcessed: true }
    })
    
    // Slight delay to respect rate limit
    await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({
    message: `Processed ${processed} emails, skipped ${skipped}`,
    processed,
    skipped
  })
}
