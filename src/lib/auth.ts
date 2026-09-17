import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  appName: 'Jahid Riad Portfolio Admin',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET ?? 'build-only-placeholder-secret-change-before-deploy',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.BETTER_AUTH_ALLOW_SIGNUP !== 'true',
    minPasswordLength: 12,
    maxPasswordLength: 128
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
  plugins: [nextCookies()]
})
