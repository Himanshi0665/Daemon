import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { db } from '@backend/utils/db'
import { requireUserByClerkId } from '@backend/utils/auth'
import { format } from 'date-fns'
import { auth } from '@clerk/nextjs/server'

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
  // Remove <style>, <script>, <head> tags and their contents completely
  cleaned = cleaned.replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, '')
  // Remove <!DOCTYPE>
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '')
  // Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, ' ')
  
  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Truncate without cutting words in half
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

  const senderInitials = (email.senderName || email.senderEmail)
    .slice(0, 2)
    .toUpperCase()

  const gmailLink = `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`

  // Fetch associated Item for AI summary
  const item = await db.item.findUnique({
    where: { gmailMessageId: email.messageId }
  })

  // Simple deterministic summary fallback if AI Item doesn't exist
  let summary = item?.description || ''
  if (!summary) {
    const rawText = email.bodyText || email.bodyHtml || email.snippet || ''
    const cleanedText = cleanAndTruncate(rawText, 250)
    summary = cleanedText ? `This email discusses: ${cleanedText}` : 'No summary available for this email.'
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
      <div className="space-y-4 mb-8 pb-8 border-b">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {email.subject}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-300">Sender: </span>
            {email.senderName ? `${email.senderName} <${email.senderEmail}>` : email.senderEmail}
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-300">Date: </span>
            {format(new Date(email.receivedAt), 'MMM d, yyyy h:mm a')}
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-300">Category: </span>
            {item?.category || 'Uncategorized'}
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-300">Priority: </span>
            {item?.priority || 'NORMAL'}
          </div>
        </div>
      </div>

      {/* Brief Summary */}
      <div className="mb-8 pb-8 border-b">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Brief Summary</h2>
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Action Required */}
      <div className="mb-10 pb-8 border-b">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Action Required</h2>
        {item?.actionRequired ? (
          <div className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
            {item.actionRequired}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 italic">
            No immediate action required.
          </p>
        )}
      </div>

      {/* View in Gmail Button */}
      <div>
        <a 
          href={gmailLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 h-10 px-4"
        >
          View in Gmail
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  )
}
