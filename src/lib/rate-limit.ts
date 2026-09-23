import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'

const DEFAULT_WINDOW_SECONDS = 10 * 60
const DEFAULT_MAX_ATTEMPTS = 5

type RateLimitOptions = {
  limit?: number
  windowSeconds?: number
}

export const isRateLimited = async (prefix: string, identifier: string, options: RateLimitOptions = {}) => {
  const limit = options.limit ?? DEFAULT_MAX_ATTEMPTS
  const windowSeconds = options.windowSeconds ?? DEFAULT_WINDOW_SECONDS
  const digest = createHash('sha256').update(identifier).digest('hex').slice(0, 32)
  const key = `portfolio:${prefix}:${digest}`

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO rate_limit_buckets (key, count, expires_at, created_at, updated_at)
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}), now(), now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limit_buckets.expires_at < now() THEN 1 ELSE rate_limit_buckets.count + 1 END,
      expires_at = CASE WHEN rate_limit_buckets.expires_at < now() THEN EXCLUDED.expires_at ELSE rate_limit_buckets.expires_at END,
      updated_at = now()
    RETURNING count
  `

  if (Math.random() < 1 / 50) {
    void prisma.$executeRaw`DELETE FROM rate_limit_buckets WHERE expires_at < now()`.catch(() => undefined)
  }

  const count = Number(rows[0]?.count)
  if (!Number.isFinite(count)) {
    throw new Error('Rate-limit service unavailable')
  }

  return count > limit
}

export const isContactRateLimited = (identifier: string, options?: RateLimitOptions) =>
  isRateLimited('contact', identifier, options)
