import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { fallbackPortfolioContent } from '../src/data/portfolio'
import { ensureCmsInitialized } from '../src/lib/cms'

const databaseUrl = process.env.DATABASE_URL
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const authSecret = process.env.BETTER_AUTH_SECRET
const authUrl = process.env.BETTER_AUTH_URL

if (!databaseUrl) throw new Error('DATABASE_URL is required to seed the database.')
if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin.')
if (adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.')
if (!authSecret || authSecret.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.')
if (!authUrl) throw new Error('BETTER_AUTH_URL is required to seed the admin.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

const main = async () => {
  await prisma.siteContent.upsert({
    where: { id: 'primary' },
    create: {
      id: 'primary',
      data: JSON.parse(JSON.stringify(fallbackPortfolioContent)) as Prisma.InputJsonValue,
      updatedBy: adminEmail
    },
    update: {}
  })

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    process.env.BETTER_AUTH_ALLOW_SIGNUP = 'true'
    const { auth } = await import('../src/lib/auth')
    await auth.api.signUpEmail({
      body: { name: 'Portfolio Administrator', email: adminEmail, password: adminPassword }
    })
  }

  await ensureCmsInitialized(adminEmail)
}

main()
  .catch((error: unknown) => {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2021') {
      throw new Error('Database tables are missing. Run `npm run db:deploy` before running `npm run db:seed`.')
    }

    throw error
  })
  .finally(() => prisma.$disconnect())
