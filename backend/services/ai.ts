import { GoogleGenAI, Type, Schema } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
import { ItemCategory, Priority } from '@prisma/client'
import { convert } from 'html-to-text'

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

const SYSTEM_PROMPT = `You are Daemon AI, an executive assistant.
Your job is to analyze incoming emails and generate a concise summary, assign a category, priority, and determine if action is explicitly required.

CATEGORIES:
- RECRUITMENT: Reach-outs from recruiters, sourcing.
- INTERVIEW: Interview invitations, scheduling, or confirmations.
- ONLINE_ASSESSMENT: Coding tests, HackerRank, CodeSignal, generic OAs.
- LEARNING: Courses, cohort starts, tutorials (e.g. AlgoZenith, Scaler, Udemy).
- MEETING: General meetings, 1:1s, calendar invites.
- DEADLINE: Urgent deadlines, expiration notices.
- FINANCE: Job offers, salary info, banking.
- BILLS: Invoices, receipts, payments.
- SHOPPING: Orders, shipping, Amazon.
- TRAVEL: Flights, hotels, bookings.
- SOCIAL: Personal conversations, friends, family.
- SECURITY: Login alerts, password resets.
- UPDATES: GitHub, system notifications.
- OTHER: General newsletters, marketing, or anything else.

ACTION REQUIRED:
Only generate an action if the email explicitly requires one (e.g., "Complete Assessment", "Schedule Interview", "Register for Event", "Verify Email", "Pay Invoice", "Review Offer", "Reply", "Upload Documents", "Accept Invitation").
If no action exists, return exactly "No action required". NEVER invent actions.

PRIORITY (evidence-based):
- HIGH: Interview tomorrow, assessment deadline today, payment overdue, security issue, urgent meeting.
- MEDIUM: Learning programs, newsletters with deadlines, event registrations, important updates.
- LOW: Promotions, newsletters, advertisements, general announcements.

SUMMARY:
Write an Executive Assistant summary (3-4 sentences). 
- Explain what the email is about.
- Explain why it was sent.
- Explain what the sender expects.
- Mention important dates.
- Explain the email, DO NOT rewrite it.
- NEVER copy the email text or the first paragraph.
- NEVER include greetings (Hi, Dear) or signatures (Best, Thanks).
- NEVER include URLs, HTML, HTML entities, or template text.
- Ensure the output is strictly valid JSON. You MUST escape all double quotes (\") inside string values to prevent JSON parsing errors.

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "summary": "3-4 sentence summary...",
  "category": "One of the 14 categories above",
  "priority": "HIGH|MEDIUM|LOW",
  "actionRequired": "The explicit action or 'No action required'",
  "reason": "Internal reasoning for debugging"
}`

function mapAICategoryToPrisma(aiCategory: string): ItemCategory {
  const c = aiCategory.toUpperCase()
  switch (c) {
    case 'RECRUITMENT': return 'RECRUITER'
    case 'INTERVIEW': return 'INTERVIEW'
    case 'ONLINE_ASSESSMENT': return 'ONLINE_ASSESSMENT'
    case 'LEARNING': return 'GENERAL'
    case 'MEETING': return 'MEETING'
    case 'DEADLINE': return 'DEADLINE'
    case 'FINANCE': return 'OFFER'
    case 'BILLS': return 'FORM'
    case 'SHOPPING': return 'GENERAL'
    case 'TRAVEL': return 'GENERAL'
    case 'SOCIAL': return 'PERSONAL'
    case 'SECURITY': return 'GENERAL'
    case 'UPDATES': return 'GENERAL'
    case 'OTHER': return 'GENERAL'
    default: return 'GENERAL'
  }
}

function sanitizeText(text: string): string {
  if (!text) return ''
  // Decode entities
  let clean = text.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  clean = clean.replace(/&#x?[0-9a-fA-F]+;/g, '')
  
  const lines = clean.split('\n')
  const validParagraphs: string[] = []
  
  const boilerplateRegex = /unsubscribe|view in browser|privacy policy|manage preferences|webengage|click here|trouble viewing|view as webpage/i
  const htmlTagRegex = /<\/?[a-z][\s\S]*>/i
  
  for (let line of lines) {
    let p = line.trim()
    if (!p) continue
    
    if (p.startsWith('PUBLIC') || p.startsWith('<!DOCTYPE') || p.startsWith('<html') || p.startsWith('<img') || p.startsWith('<link')) continue
    if (htmlTagRegex.test(p)) continue
    if (boilerplateRegex.test(p)) continue
    
    const urlCount = (p.match(/https?:\/\/[^\s]+/gi) || []).length
    if (urlCount > 2) continue
    
    p = p.replace(/https?:\/\/[^\s]+/gi, '')
    p = p.replace(/www\.[^\s]+/gi, '')
    p = p.replace(/\[<.*?>\]/g, '')
    p = p.trim()
    
    if (p.length < 15) continue
    
    const alphaCount = (p.match(/[a-zA-Z]/g) || []).length
    if (alphaCount < p.length * 0.4) continue
    
    const uppercaseCount = (p.match(/[A-Z]/g) || []).length
    if (alphaCount > 0 && uppercaseCount > alphaCount * 0.8) continue
    
    if (!/[.!?]/.test(p) && p.length < 30) continue
    
    validParagraphs.push(p)
  }
  
  return validParagraphs.join('\n\n')
}

function isValidExtraction(text: string): boolean {
  if (text.length < 50) return false
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length < 2) return false
  return true
}

function isContentClean(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  const invalidKeywords = [
    '<!DOCTYPE', 'PUBLIC "-//W3C', '<html', '<head', '<body', '<link', '<meta', '<style', '<script', '<img',
    'src=', 'href=', 'xmlns', 'cid:', 'Content-Type:', 'boundary=', 'MIME-Version', 'charset=', 'quoted-printable', 'data:image',
    'https://', 'http://', '&#', '&quot;'
  ];
  
  for (const kw of invalidKeywords) {
    if (text.includes(kw)) return false;
  }
  
  return true;
}

export function extractContentPipeline(emailData: { bodyText?: string | null, bodyHtml?: string | null, snippet: string }) {
  let extracted = ''
  
  if (emailData.bodyText) {
    extracted = sanitizeText(emailData.bodyText)
    if (isContentClean(extracted) && isValidExtraction(extracted)) return { extracted, source: 'bodyText' }
  }
  
  if (emailData.bodyHtml) {
    try {
      const converted = convert(emailData.bodyHtml, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'style', format: 'skip' },
          { selector: 'script', format: 'skip' }
        ]
      })
      extracted = sanitizeText(converted)
      if (isContentClean(extracted) && isValidExtraction(extracted)) return { extracted, source: 'bodyHtml' }
    } catch (e) {
      console.error('[ai] html-to-text failed:', e)
    }
  }
  
  extracted = sanitizeText(emailData.snippet)
  if (isContentClean(extracted) && extracted.length > 5) return { extracted, source: 'snippet' }
  
  return { extracted: null, source: 'none' }
}

export async function analyzeEmail(emailData: {
  subject: string
  sender: string
  snippet: string
  bodyText?: string | null
  bodyHtml?: string | null
}, _debugLog?: (step: string, data: any) => void): Promise<AIAnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    return null
  }

  const { extracted: cleanText, source } = extractContentPipeline(emailData)
  
  if (_debugLog) {
    _debugLog('STEP 3', { extractedReadableContent: cleanText, source })
  }

  if (!cleanText) {
    return {
      title: 'Email Summary',
      category: 'GENERAL',
      company: null,
      description: "Unable to generate a reliable summary for this email.",
      priority: 'LOW',
      deadline: null,
      eventDate: null,
      eventTime: null,
      actionRequired: null,
      isActionable: false,
      confidenceScore: 1.0
    }
  }

  // Truncate safely
  const finalContent = cleanText.substring(0, 3000)
  const text = `Sender: ${emailData.sender}\nSubject: ${emailData.subject}\nBody:\n${finalContent}`
  
  if (_debugLog) {
    _debugLog('STEP 4', { promptSentToGemini: text })
  }

  const ai = new GoogleGenAI({ apiKey })

  let retries = 3
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: text,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        }
      })

      const resultText = response.text
      if (_debugLog) {
        _debugLog('STEP 5', { geminiRawJson: resultText })
      }

      if (!resultText) return null

      // Clean potential markdown wrapping (e.g. ```json ... ```)
      const cleanedText = resultText.replace(/^```json[\s\n]*/, '').replace(/[\s\n]*```$/, '').trim()
      const parsed = JSON.parse(jsonrepair(cleanedText))
      
      const actionReq = parsed.actionRequired === 'No action required' ? null : parsed.actionRequired
      const isActionable = !!actionReq

      // Extract company
      const senderParts = emailData.sender.split('@')
      const domain = senderParts.length > 1 ? senderParts[1].split('.')[0] : null
      const company = domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : null

      const result: AIAnalysisResult = {
        category: mapAICategoryToPrisma(parsed.category),
        title: emailData.subject || 'No Subject',
        company,
        description: parsed.summary,
        deadline: null,
        eventDate: null,
        eventTime: null,
        actionRequired: actionReq,
        isActionable,
        priority: parsed.priority === 'CRITICAL' ? 'CRITICAL' : (parsed.priority as Priority) || 'MEDIUM',
        confidenceScore: 1.0
      }

      return result
    } catch (error: any) {
      if (error?.status === 429 && retries > 1) {
        console.warn('[ai] Rate limited (429). Retrying in 35 seconds...', error.message)
        retries--
        await new Promise(resolve => setTimeout(resolve, 35000))
        continue
      }
      
      console.error('[ai] Failed to analyze email using Gemini, falling back to deterministic extraction:', error)
      
      // Generate a fallback summary using the clean extracted text
      // Remove short generic lines to avoid "Hi Himanshi"
      const sentences = finalContent
        .split(/(?<=[.!?\n])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && !s.toLowerCase().startsWith('hi ') && !s.toLowerCase().startsWith('dear '));
        
      let fallbackSummary = sentences.slice(0, 3).join(' ');
      if (!fallbackSummary) {
        fallbackSummary = "This email was received and processed. No detailed content could be automatically extracted. Please view the original email for full details.";
      }

      return {
        title: 'Email Summary',
        category: 'GENERAL',
        description: fallbackSummary,
        priority: 'LOW',
        actionRequired: null
      } as AIAnalysisResult
    }
  }
  return null
}
