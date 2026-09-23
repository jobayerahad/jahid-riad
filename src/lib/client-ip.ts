import { headers } from 'next/headers'

/**
 * Prefer platform-injected IPs that clients cannot spoof.
 * Do not trust the first X-Forwarded-For hop — it is client-controlled unless a trusted proxy rewrites it.
 */
export const getClientIp = async () => {
  const requestHeaders = await headers()
  return (
    requestHeaders.get('cf-connecting-ip') ??
    requestHeaders.get('x-real-ip') ??
    requestHeaders.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ??
    null
  )
}
