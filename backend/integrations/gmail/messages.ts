/**
 * Gmail message fetching and parsing.
 *
 * Responsibilities:
 *   - Fetch message list (IDs only) from Gmail API
 *   - Fetch full message details in batches
 *   - Parse headers (From, Subject, Date)
 *   - Decode body (text/plain, text/html)
 *   - Handle pagination, retries, and rate limits
 */
import { google, gmail_v1 } from 'googleapis'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParsedEmail = {
  messageId: string
  threadId: string
  historyId: string | undefined
  senderName: string | null
  senderEmail: string
  subject: string
  snippet: string
  receivedAt: Date
  internalDate: string
  labels: string[]
  isRead: boolean
  isStarred: boolean
  bodyText: string | null
  bodyHtml: string | null
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches recent message IDs from Gmail.
 * Returns up to `maxResults` message IDs (default 100).
 */
export async function listMessageIds(
  accessToken: string,
  params: {
    maxResults?: number
    pageToken?: string
    labelIds?: string[]
    q?: string
  } = {},
): Promise<{ ids: { id: string; threadId: string }[]; nextPageToken?: string }> {
  const client = createGmailClient(accessToken)

  const res = await client.users.messages.list({
    userId: 'me',
    maxResults: params.maxResults ?? 500,
    labelIds: params.q ? undefined : (params.labelIds ?? ['INBOX']),
    pageToken: params.pageToken,
    q: params.q ?? 'category:primary',
  })

  const ids = (res.data.messages ?? []).map((m) => ({
    id: m.id!,
    threadId: m.threadId!,
  }))

  return {
    ids,
    nextPageToken: res.data.nextPageToken ?? undefined,
  }
}

/**
 * Fetches full message details for a list of message IDs.
 * Processes in batches of 10 to respect Gmail API quotas.
 * Retries failed requests up to 3 times with exponential backoff.
 */
export async function fetchMessages(
  accessToken: string,
  messageIds: { id: string; threadId: string }[],
): Promise<ParsedEmail[]> {
  const client = createGmailClient(accessToken)
  const results: ParsedEmail[] = []
  const BATCH_SIZE = 10

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batch = messageIds.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map((msg) => fetchSingleMessage(client, msg.id)),
    )

    for (const result of batchResults) {
      if (result) results.push(result)
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < messageIds.length) {
      await sleep(100)
    }
  }

  return results
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function createGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth: oauth2Client })
}

async function fetchSingleMessage(
  client: gmail_v1.Gmail,
  messageId: string,
  retries = 3,
): Promise<ParsedEmail | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await client.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      return parseMessage(res.data)

    } catch (err: any) {
      const status = err?.response?.status ?? err?.code

      // 429 = rate limit, 5xx = server error — retry with backoff
      if ((status === 429 || status >= 500) && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 500 // 500ms, 1s, 2s
        console.warn(
          `[messages] Retrying message ${messageId} in ${delay}ms (attempt ${attempt + 1})`,
        )
        await sleep(delay)
        continue
      }

      // 404 = message was deleted between list and get — skip it
      if (status === 404) {
        console.warn(`[messages] Message ${messageId} not found — skipping`)
        return null
      }

      console.error(`[messages] Failed to fetch message ${messageId}:`, err)
      return null
    }
  }

  return null
}

function parseMessage(msg: gmail_v1.Schema$Message): ParsedEmail {
  const headers = msg.payload?.headers ?? []
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''

  // Parse "From" header: "Name <email@example.com>" or "email@example.com"
  const fromRaw = getHeader('From')
  const { name: senderName, email: senderEmail } = parseFromHeader(fromRaw)

  const subject = getHeader('Subject') || '(No subject)'

  // Parse date
  const dateHeader = getHeader('Date')
  const receivedAt = dateHeader ? new Date(dateHeader) : new Date()

  // Labels
  const labels = msg.labelIds ?? []
  const isRead = !labels.includes('UNREAD')
  const isStarred = labels.includes('STARRED')

  // Body
  const { text, html } = extractBody(msg.payload ?? {})

  return {
    messageId: msg.id!,
    threadId: msg.threadId!,
    historyId: msg.historyId ?? undefined,
    senderName,
    senderEmail,
    subject,
    snippet: msg.snippet ?? '',
    receivedAt,
    internalDate: msg.internalDate ?? String(Date.now()),
    labels,
    isRead,
    isStarred,
    bodyText: text,
    bodyHtml: html,
  }
}

/**
 * Parses "Name <email>" or just "email" from the From header.
 */
function parseFromHeader(raw: string): { name: string | null; email: string } {
  // Match: "Display Name <email@domain.com>"
  const match = raw.match(/^"?(.+?)"?\s*<(.+?)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  // Bare email
  return { name: null, email: raw.trim() }
}

/**
 * Recursively extracts text/plain and text/html body from Gmail message parts.
 */
function extractBody(
  payload: gmail_v1.Schema$MessagePart,
): { text: string | null; html: string | null } {
  let text: string | null = null
  let html: string | null = null

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    text = decodeBase64Url(payload.body.data)
  }

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    html = decodeBase64Url(payload.body.data)
  }

  // Recursively search multipart messages
  if (payload.parts) {
    for (const part of payload.parts) {
      const child = extractBody(part)
      if (child.text && !text) text = child.text
      if (child.html && !html) html = child.html
    }
  }

  return { text, html }
}

/**
 * Decodes Gmail's base64url-encoded body data.
 */
function decodeBase64Url(data: string): string {
  // Gmail uses URL-safe base64 (no padding, - and _ instead of + and /)
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf8')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
