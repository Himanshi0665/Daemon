import { PrismaClient } from '@prisma/client'
import { analyzeEmail } from '../backend/services/ai'
import { config } from 'dotenv'

// Load environment variables for local testing
config({ path: './frontend/.env.local' })
config({ path: './.env' })

const db = new PrismaClient()

async function main() {
  console.log('Starting AI regeneration process...')

  let processed = 0
  let failures = 0
  let skipped = 0
  let isFirst = true

  let lastId: string | undefined = undefined
  let hasMore = true
  const BATCH_SIZE = 20

  const TEST_IDS = [
    'cmrqabc5w026pv6a8ozdt96g2',
    'cmrqabewf028hv6a8ir4hyr12',
    'cmrqabbsc0267v6a8pgpeerlh',
    'cmrqabcvj0279v6a8zmw8vz48',
    'cmrqabbt1026jv6a85yf3hxvt'
  ]

  while (hasMore) {
    const queryArgs: any = {
      orderBy: { id: 'asc' },
      take: BATCH_SIZE
    }
    
    if (lastId) {
      queryArgs.cursor = { id: lastId }
      queryArgs.skip = 1 // Skip the cursor itself
    }

    const emails = await db.syncedEmail.findMany(queryArgs)
    
    if (emails.length === 0) {
      hasMore = false
      break
    }

    console.log(`\nProcessing batch of ${emails.length} emails (lastId: ${lastId || 'none'})...`)

    for (const email of emails) {
      let oldSummary = ''

      if (isFirst) {
        console.log('\n==================================================')
        console.log('STEP 1: Raw Gmail response')
        console.log('==================================================')
        console.log('Snippet:', email.snippet)
        console.log('\nBodyText:', email.bodyText ? email.bodyText.substring(0, 500) + '... (truncated)' : 'NULL')
        console.log('\nBodyHtml:', email.bodyHtml ? email.bodyHtml.substring(0, 500) + '... (truncated)' : 'NULL')
        console.log('==================================================\n')
        
        const existingItemForFirst = await db.item.findUnique({
          where: { gmailMessageId: email.messageId }
        })
        oldSummary = existingItemForFirst?.description || ''
      }

      const debugLogger = isFirst ? (step: string, data: any) => {
        console.log('\n==================================================')
        console.log(step)
        console.log('==================================================')
        if (typeof data === 'string') {
          console.log(data)
        } else {
          console.dir(data, { depth: null })
        }
        console.log('==================================================\n')
      } : undefined

      const analysis = await analyzeEmail({
        subject: email.subject || '',
        sender: email.senderEmail || '',
        snippet: email.snippet || '',
        bodyText: email.bodyText,
        bodyHtml: email.bodyHtml
      }, debugLogger)

      if (analysis) {
        // Find existing item or create
        const existingItem = await db.item.findUnique({
          where: { gmailMessageId: email.messageId }
        })

        if (existingItem) {
          await db.item.update({
            where: { id: existingItem.id },
            data: {
              category: analysis.category,
              company: analysis.company,
              title: analysis.title,
              description: analysis.description, // Overwrite the summary unconditionally
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
        } else {
          await db.item.create({
            data: {
              userId: email.userId,
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
        }
        
        if (isFirst) {
          console.log('\n==================================================')
          console.log('STEP 6: Database value')
          console.log('==================================================')
          console.log(JSON.stringify(analysis, null, 2))
          console.log('==================================================\n')
          
          console.log('\n==================================================')
          console.log('STEP 7: Frontend rendered value')
          console.log('==================================================')
          console.log(`The frontend Email Detail page will render exactly this summary text:`)
          console.log(`"${analysis.description}"`)
          console.log(`No other metadata, links, or boilerplate will be shown on the screen.`)
          console.log('==================================================\n')
          
          console.log('\n==================================================')
          console.log('BEFORE AND AFTER SUMMARY')
          console.log('==================================================')
          console.log('Old summary:\n' + oldSummary)
          console.log('\n↓\n')
          console.log('New summary:\n' + analysis.description)
          console.log('==================================================\n')

          isFirst = false
        }
        
        processed++
      } else {
        failures++
      }
      
      lastId = email.id
      
      // 15000ms delay to respect 5 RPM API limit for 2.5-flash
      await new Promise(r => setTimeout(r, 15000))
    }
    
  }

  console.log(`\n==================================================`)
  console.log(`FINAL REPORT`)
  console.log(`==================================================`)
  console.log(`Total regenerated:  ${processed}`)
  console.log(`Total failures:     ${failures}`)
  console.log(`Total skipped:      ${skipped}`)
  console.log(`==================================================\n`)
}

main().catch(console.error).finally(() => db.$disconnect())
