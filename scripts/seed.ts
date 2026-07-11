/**
 * Database seed script.
 * Run from the frontend directory: npm run db:seed
 *
 * Phase 1: No seed data needed.
 * Phase 2+: Add sample users, items, tasks, etc. here.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  console.log('Seeding database...')

  // Nothing to seed in Phase 1.
  // Authentication creates users via the Clerk webhook.

  console.log('Done.')
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
