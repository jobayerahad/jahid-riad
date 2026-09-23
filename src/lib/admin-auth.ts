import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const ADMIN_SESSION_COOKIE = 'admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

const TOKEN_BYTES = 32

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge
})

export const createAdminSession = async (
  adminId: string,
  meta: { ipAddress?: string | null; userAgent?: string | null } = {}
) => {
  const token = randomBytes(TOKEN_BYTES).toString('base64url')
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000)

  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId,
      expiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null
    }
  })

  const jar = await cookies()
  jar.set(ADMIN_SESSION_COOKIE, token, cookieOptions(ADMIN_SESSION_TTL_SECONDS))

  return token
}

export const readAdminSession = cache(async () => {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true }
  })

  if (!session) return null

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined)
    jar.set(ADMIN_SESSION_COOKIE, '', cookieOptions(0))
    return null
  }

  return session
})

export const deleteAdminSession = async () => {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value

  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } })
  }

  jar.set(ADMIN_SESSION_COOKIE, '', cookieOptions(0))
}
