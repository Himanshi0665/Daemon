import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ take: 5 })
  console.log('=== Users ===')
  console.log(JSON.stringify(users, null, 2))

  const gmailAccounts = await prisma.gmailAccount.findMany({ take: 5 })
  console.log('\n=== GmailAccounts ===')
  console.log(JSON.stringify(gmailAccounts, null, 2))

  // List all model names available on prisma
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
  console.log('\n=== Available models ===', modelNames)
}

main().catch(console.error).finally(() => prisma.$disconnect())
