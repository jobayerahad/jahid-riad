import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'
import { isAdminConfigured } from '@/lib/admin-config'

const handler = toNextJsHandler(auth)
const unavailable = () => Response.json({ message: 'Admin authentication is not configured.' }, { status: 503 })

export const GET = isAdminConfigured() ? handler.GET : unavailable
export const POST = isAdminConfigured() ? handler.POST : unavailable
