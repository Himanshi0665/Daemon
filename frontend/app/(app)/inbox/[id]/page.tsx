import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { db } from '@backend/utils/db'
import { requireUserByClerkId } from '@backend/utils/auth'
import { auth } from '@clerk/nextjs/server'
import { convert } from 'html-to-text'

async function getEmail(id: string, userId: string) {
  const email = await db.syncedEmail.findFirst({
    where: { id, userId }
  })
  if (email && !email.isRead) {
    await db.syncedEmail.update({
      where: { id },
      data: { isRead: true, labels: email.labels.filter(l => l !== 'UNREAD') }
    })
    email.isRead = true
  }
  return email
}

function cleanAndTruncate(text: string, maxLength: number = 250): string {
  if (!text) return ''
  
  let cleaned = text
  try {
    cleaned = convert(cleaned, { wordwrap: false })
  } catch (e) {
    // fallback
    cleaned = cleaned.replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, '')
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '')
    cleaned = cleaned.replace(/<[^>]*>?/gm, ' ')
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
  }
  
  if (cleaned.length <= maxLength) return cleaned
  
  const truncated = cleaned.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

export default async function EmailReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) notFound()
  const user = await requireUserByClerkId(clerkId)
  const { id } = await params
  const email = await getEmail(id, user.id)

  if (!email) {
    notFound()
  }

  const gmailLink = `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`

  // Fetch associated Item for AI summary
  const item = await db.item.findUnique({
    where: { gmailMessageId: email.messageId }
  })

  // Simple deterministic summary fallback if AI Item doesn't exist
  let summary = item?.description || ''
  if (!summary) {
    const rawText = email.bodyHtml || email.bodyText || email.snippet || ''
    const cleanedText = cleanAndTruncate(rawText, 500)
    summary = cleanedText ? cleanedText : 'No summary available for this email.'
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-6 md:p-8 max-w-3xl mx-auto overflow-y-auto">
      
      {/* Back to Inbox */}
      <div className="mb-8">
        <Link 
          href="/inbox" 
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inbox
        </Link>
      </div>

      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {email.subject}
        </h1>
      </div>

      {/* Brief Summary */}
      <div className="mb-10">
        <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {summary}
        </p>
      </div>

      {/* View in Gmail Button */}
      <div>
        <a 
          href={gmailLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 h-11 px-6"
        >
          View in Gmail
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  )
}
