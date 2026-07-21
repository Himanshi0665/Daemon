import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@backend/utils/db'
import { requireUserByClerkId } from '@backend/utils/auth'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await requireUserByClerkId(clerkId)

  // Get emails from the last 48 hours
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const recentEmails = await db.syncedEmail.findMany({
    where: { userId: user.id, receivedAt: { gte: since } },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  })

  if (recentEmails.length === 0) {
    return NextResponse.json({ summary: "No recent emails to summarize." })
  }

  const prompt = `You are Daemon AI. Write a personalized 3-4 sentence morning brief based on these recent emails.
Do not use generic database counts. Read the content and highlight specific important updates.
Example style: "You received 14 recruiter emails. 3 online assessments expire tomorrow. 2 interview invitations need action."

Recent emails:
${recentEmails.map(e => `From: ${e.senderName || e.senderEmail}\nSubject: ${e.subject}\nSnippet: ${e.snippet}`).join('\n\n')}`

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    // Generate deterministic summary from real data
    const unreadCount = recentEmails.filter((e) => !e.isRead).length
    const senders = recentEmails.map((e) => e.senderName || e.senderEmail)
    const topSender = senders.sort((a,b) =>
          senders.filter(v => v===a).length
        - senders.filter(v => v===b).length
    ).pop()

    return NextResponse.json({ 
      summary: `You received ${recentEmails.length} recent emails (${unreadCount} unread). Most frequent sender is ${topSender}. Review your inbox to stay up to date.` 
    })
  }

  const ai = new GoogleGenAI({ apiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return NextResponse.json({ summary: response.text })
  } catch (error) {
    console.error('[ai/summary]', error)
    return NextResponse.json({ summary: "Failed to generate AI summary." })
  }
}
