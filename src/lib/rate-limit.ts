import { createHash } from 'node:crypto'
import type { ContactEnv } from './env'

const WINDOW_SECONDS = 10 * 60
const MAX_ATTEMPTS = 5
const SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
`

type RedisResponse = { result?: number; error?: string }

export const isContactRateLimited = async (identifier: string, env: ContactEnv) => {
  const digest = createHash('sha256').update(identifier).digest('hex').slice(0, 32)
  const key = `portfolio:contact:${digest}`
  const response = await fetch(env.UPSTASH_REDIS_REST_URL.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(['EVAL', SCRIPT, '1', key, String(WINDOW_SECONDS)]),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000)
  })
  const data = (await response.json()) as RedisResponse

  if (!response.ok || data.error || typeof data.result !== 'number') {
    throw new Error('Rate-limit service unavailable')
  }

  return data.result > MAX_ATTEMPTS
}
