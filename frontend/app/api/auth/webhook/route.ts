import { headers } from 'next/headers'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@backend/utils/db'

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Server configuration error', { status: 500 })
  }

  // Verify the webhook signature using svix
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  let event: WebhookEvent

  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  // Create user and preferences when a new Clerk user signs up
  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = event.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return new Response('No email address found on user', { status: 400 })
    }

    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    try {
      await db.user.create({
        data: {
          clerkId: id,
          email,
          name,
          avatarUrl: image_url ?? null,
          preferences: {
            create: {}, // All UserPreferences fields have defaults in the schema
          },
        },
      })
    } catch (error) {
      console.error('Failed to create user in database:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
