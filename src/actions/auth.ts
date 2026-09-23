'use server'

import { headers } from 'next/headers'
import { isAdminConfigured } from '@/lib/admin-config'
import { createAdminSession, deleteAdminSession } from '@/lib/admin-auth'
import { getClientIp } from '@/lib/client-ip'
import { hashPassword, needsRehash, verifyPasswordSafe } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { isRateLimited } from '@/lib/rate-limit'
import { adminSignInSchema } from '@/schemas/auth'

export type AuthActionResult = { ok: true } | { ok: false; message: string }

const GENERIC_FAILURE: AuthActionResult = {
  ok: false,
  message: 'The email or password is incorrect.'
}

const RATE_LIMITED: AuthActionResult = {
  ok: false,
  message: 'Too many sign-in attempts. Please try again later.'
}

const getClientMeta = async () => {
  const requestHeaders = await headers()
  const ipAddress = await getClientIp()
  const userAgent = requestHeaders.get('user-agent')

  return { ipAddress, userAgent }
}

export const signInAdmin = async (formData: FormData): Promise<AuthActionResult> => {
  if (!isAdminConfigured()) return GENERIC_FAILURE

  const parsed = adminSignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  if (!parsed.success) return GENERIC_FAILURE

  const email = parsed.data.email.toLowerCase()
  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const { ipAddress, userAgent } = await getClientMeta()

  try {
    const limited = await isRateLimited('admin-signin', `${ipAddress ?? 'unknown'}:${email}`)
    if (limited) return RATE_LIMITED
  } catch {
    return RATE_LIMITED
  }

  if (!allowedEmail || email !== allowedEmail) {
    await verifyPasswordSafe(parsed.data.password, null)
    return GENERIC_FAILURE
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: allowedEmail } })
  const passwordOk = await verifyPasswordSafe(parsed.data.password, admin?.passwordHash)
  if (!admin || !passwordOk) return GENERIC_FAILURE

  if (needsRehash(admin.passwordHash)) {
    const nextHash = await hashPassword(parsed.data.password)
    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: nextHash } })
  }

  await createAdminSession(admin.id, { ipAddress, userAgent })
  return { ok: true }
}

export const signOutAdmin = async (): Promise<AuthActionResult> => {
  await deleteAdminSession()
  return { ok: true }
}
