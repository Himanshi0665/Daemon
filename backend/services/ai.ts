import { GoogleGenAI } from '@google/genai'
import { ItemCategory, Priority } from '@prisma/client'

export type AIAnalysisResult = {
  category: ItemCategory
  title: string
  company: string | null
  description: string | null
  deadline: string | null // ISO string
  eventDate: string | null // ISO string
  eventTime: string | null
  actionRequired: string | null
  isActionable: boolean
  priority: Priority
  confidenceScore: number
}

const SYSTEM_PROMPT = `You are Daemon AI, an intelligent email operating system analyzer.
You will be given the subject, sender, and snippet/body of an email.
Your job is to extract structured data and categorize the email.

CATEGORIES:
- INTERVIEW: Interview invitations, scheduling, or confirmations.
- ONLINE_ASSESSMENT: Coding tests, HackerRank, CodeSignal, generic OAs.
- ASSIGNMENT: Take-home projects, school assignments.
- DEADLINE: Urgent deadlines, expiration notices.
- MEETING: General meetings, 1:1s, calendar invites.
- RECRUITER: Reach-outs from recruiters, sourcing.
- FORM: Requests to fill out forms, surveys.
- OFFER: Job offers, acceptances.
- REJECTION: Job rejections.
- PERSONAL: Personal conversations, friends, family.
- GENERAL: Newsletters, marketing, receipts, or anything else.

PRIORITIES:
- CRITICAL: Must be done today/tomorrow or extremely important (e.g. Offer, imminent deadline).
- HIGH: Important (e.g. Interview, OA, Recruiter).
- MEDIUM: Standard tasks.
- LOW: Informational, newsletters, rejections.

INSTRUCTIONS:
Extract the requested fields. Ensure dates are in ISO 8601 format if detected (e.g., "2023-10-05T00:00:00Z"). If no explicit date is mentioned, use null.
If action is required, describe it briefly (e.g. "Reply with availability").
Return only a raw valid JSON object without markdown formatting.

Format:
{
  "category": "CATEGORY",
  "title": "Short descriptive title",
  "company": "Company Name or null",
  "description": "1-2 sentence summary",
  "deadline": "ISO date string or null",
  "eventDate": "ISO date string or null",
  "eventTime": "Time string or null",
  "actionRequired": "What needs to be done or null",
  "isActionable": boolean,
  "priority": "CRITICAL|HIGH|MEDIUM|LOW",
  "confidenceScore": 0.0 to 1.0
}`

export async function analyzeEmail(emailData: {
  subject: string
  sender: string
  snippet: string
  bodyText?: string | null
}): Promise<AIAnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    // Deterministic fallback based on content matching
    const subject = emailData.subject.toLowerCase()
    const body = (emailData.bodyText || emailData.snippet).toLowerCase()
    const content = subject + ' ' + body

    let category: ItemCategory = 'GENERAL'
    let priority: Priority = 'LOW'
    let isActionable = false
    let actionRequired: string | null = null

    // 1. BILLS / Subscriptions (FORM / REJECTION)
    if (content.includes('invoice') || content.includes('receipt') || subject.includes('payment') || content.includes('billed')) {
      category = 'FORM' // Maps to "Bills"
      priority = 'HIGH'
      isActionable = true
      actionRequired = 'Pay Bill'
    } else if (content.includes('subscription') || content.includes('renew') || emailData.sender.includes('netflix') || emailData.sender.includes('spotify')) {
      category = 'REJECTION' // Maps to "Subscriptions"
      priority = 'LOW'
      actionRequired = 'Ignore'
    } 
    // 2. INTERVIEW / OA
    else if (content.includes('assessment') || content.includes('hackerrank') || content.includes('codesignal') || subject.includes('online test')) {
      category = 'ONLINE_ASSESSMENT' // "Online Assessment"
      priority = 'CRITICAL'
      isActionable = true
      actionRequired = 'Complete OA'
    } else if (content.includes('interview') || content.includes('schedule') || subject.includes('invitation to interview')) {
      category = 'INTERVIEW' // "Interview"
      priority = 'HIGH'
      isActionable = true
      actionRequired = 'Attend Interview' 
    } 
    // 3. PLACEMENT / INTERNSHIP / RECRUITER
    else if (content.includes('internship') || subject.includes('intern')) {
      category = 'MEETING' // Maps to "Internship"
      priority = 'MEDIUM'
      actionRequired = 'Read Later'
    } else if (content.includes('placement') || content.includes('offer')) {
      category = 'OFFER' // Maps to "Placement"
      priority = 'HIGH'
      isActionable = true
      actionRequired = 'Reply'
    } else if (content.includes('recruiter') || content.includes('talent') || content.includes('application')) {
      category = 'RECRUITER' // "Recruiter"
      priority = 'MEDIUM'
      actionRequired = 'Read Later'
    }
    // 4. COLLEGE / LEARNING
    else if (content.includes('assignment') || content.includes('homework') || content.includes('exam')) {
      category = 'ASSIGNMENT' // "College"
      priority = 'HIGH'
      isActionable = true
      actionRequired = 'Submit Assignment'
    } else if (content.includes('course') || content.includes('learning') || content.includes('cohort') || emailData.sender.includes('algozenith') || content.includes('tutorial')) {
      category = 'DEADLINE' // Maps to "Learning"
      priority = 'LOW'
      actionRequired = 'Read Later'
    }
    // 5. PERSONAL / PROMOTION (GENERAL)
    else if (emailData.sender.includes('marketing') || emailData.sender.includes('newsletter') || content.includes('unsubscribe') || content.includes('off') || content.includes('sale') || content.includes('discount')) {
      category = 'GENERAL' // "Promotion"
      priority = 'LOW'
      actionRequired = 'Ignore'
    } else {
      category = 'PERSONAL' // "Personal"
      priority = 'LOW'
      actionRequired = 'Read Later'
    }

    // Extract possible company by finding a capitalized word before 'interview', 'offer', etc.
    const senderParts = emailData.sender.split('@')
    const domain = senderParts.length > 1 ? senderParts[1].split('.')[0] : null
    const company = domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : null

    return {
      category,
      title: emailData.subject || 'No Subject',
      company,
      description: emailData.snippet.substring(0, 100) + (emailData.snippet.length > 100 ? '...' : ''),
      deadline: null,
      eventDate: null,
      eventTime: null,
      actionRequired,
      isActionable,
      priority,
      confidenceScore: 1.0 // Deterministic fallback
    }
  }

  const ai = new GoogleGenAI({ apiKey })

  try {
    const text = `Sender: ${emailData.sender}\nSubject: ${emailData.subject}\nBody: ${emailData.bodyText ? emailData.bodyText.substring(0, 2000) : emailData.snippet}`
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      }
    })

    const resultText = response.text
    if (!resultText) return null

    const result = JSON.parse(resultText)
    return result as AIAnalysisResult
  } catch (error) {
    console.error('[ai] Failed to analyze email:', error)
    return null
  }
}
