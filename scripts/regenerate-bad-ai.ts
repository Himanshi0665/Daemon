import { PrismaClient } from '@prisma/client'
import { analyzeEmail } from '../backend/services/ai'
import { config } from 'dotenv'

// Load environment variables for local testing
config({ path: './frontend/.env.local' })
config({ path: './.env' })

const db = new PrismaClient()

async function main() {
  console.log('Finding emails with bad summaries...')
  
  const badPatterns = [
    '<img', '<html', 'DOCTYPE', 'PUBLIC', '<link', 'href=', 'src=', '&#'
  ];
  
  const allItems = await db.item.findMany();

  const badItems = allItems.filter(item => {
    if (!item.description) return false;
    for (const pattern of badPatterns) {
      if (item.description.includes(pattern)) return true;
    }
    return false;
  });

  console.log(`Found ${badItems.length} emails with bad summaries.`);

  for (const item of badItems) {
    const email = await db.syncedEmail.findFirst({
      where: { messageId: item.gmailMessageId }
    });

    if (!email) {
      console.log(`Item ${item.id} has no synced email.`);
      continue;
    }

    const isTargetEmail = email.subject?.includes('ZS') || email.subject?.includes('AlgoZenith') || email.subject?.includes('Decision Analytics Associate') || email.subject?.includes('Cohort 16');

    if (isTargetEmail) {
      console.log('\n==================================================')
      console.log('TARGET EMAIL DETECTED')
      console.log('Subject:', email.subject)
      console.log('==================================================')
      console.log('BEFORE SUMMARY:')
      console.log(item.description)
      console.log('==================================================')
    }

    const debugLogger = isTargetEmail ? (step: string, data: any) => {
      console.log(`\n[${step}]`)
      if (typeof data === 'string') {
        console.log(data)
      } else {
        console.dir(data, { depth: null })
      }
    } : undefined;

    const analysis = await analyzeEmail({
      subject: email.subject || '',
      sender: email.senderEmail || '',
      snippet: email.snippet || '',
      bodyText: email.bodyText,
      bodyHtml: email.bodyHtml
    }, debugLogger)

    if (analysis) {
      await db.item.update({
        where: { id: item.id },
        data: {
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
      
      if (isTargetEmail) {
        console.log('\n==================================================')
        console.log('AFTER SUMMARY:')
        console.log(analysis.description)
        console.log('==================================================\n')
      }
    } else {
       console.log(`Failed to analyze email ${email.subject}`)
    }

    // sleep
    await new Promise(r => setTimeout(r, 15000))
  }
}

main().catch(console.error).finally(() => db.$disconnect())
