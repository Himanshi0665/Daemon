/**
 * Auth utility — resolves Clerk user IDs to Prisma user IDs.
 *
 * Every API route that touches user-owned data needs the Prisma User.id,
 * not the Clerk userId. This helper bridges the two.
 *
 * If the webhook hasn't created the user yet (common in development),
 * requireUserByClerkId will auto-create the user from the Clerk session.
 */
import { db } from '@backend/utils/db'

/**
 * Looks up the Prisma User by their Clerk ID.
 * Returns the full User row or null if not found.
 */
export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({ where: { clerkId } })
}

/**
 * Resolves a Clerk ID to a Prisma User.
 * If the user doesn't exist in the database (webhook not configured),
 * auto-creates them from the Clerk session data.
 */
export async function requireUserByClerkId(clerkId: string) {
  let user = await db.user.findUnique({ where: { clerkId } })

  if (!user) {
    // Webhook hasn't created the user yet — auto-create from Clerk API
    const res = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch user from Clerk API: ${res.status}`)
    }
    
    const clerkUser = await res.json()

    const email = clerkUser.email_addresses?.[0]?.email_address
    if (!email) {
      throw new Error(
        `Clerk user ${clerkId} has no email address.`,
      )
    }

    const name = [clerkUser.first_name, clerkUser.last_name]
      .filter(Boolean)
      .join(' ') || null

    user = await db.user.create({
      data: {
        clerkId,
        email,
        name,
        avatarUrl: clerkUser.image_url ?? null,
        preferences: {
          create: {},
        },
      },
    })

    console.log(`[auth] Auto-created Prisma user for clerkId=${clerkId}`)
  }

  return user
}
