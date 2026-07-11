/**
 * AES-256-GCM encryption for sensitive values (Gmail tokens).
 *
 * Format: `iv:authTag:ciphertext` (base64 segments joined by `:`)
 *
 * Requires ENCRYPTION_KEY env var — 64 hex characters (32 bytes).
 * Generate with: openssl rand -hex 32
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12   // 96-bit IV — GCM recommended
const TAG_BYTES = 16  // 128-bit authentication tag

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32',
    )
  }
  const key = Buffer.from(raw, 'hex')
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes (64 hex chars). Got ${key.length} bytes.`,
    )
  }
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext — expected format: iv:tag:data')
  }
  const [ivB64, tagB64, encB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const enc = Buffer.from(encB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return (
    decipher.update(enc).toString('utf8') + decipher.final('utf8')
  )
}
