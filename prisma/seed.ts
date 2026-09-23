import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { hashPassword } from '../src/lib/password'
import { ensureCmsInitialized } from '../src/lib/cms'

const databaseUrl = process.env.DATABASE_URL
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

if (!databaseUrl) throw new Error('DATABASE_URL is required to seed the database.')
if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin.')
if (adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

const main = async () => {
  const email = adminEmail.toLowerCase()
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } })
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash: await hashPassword(adminPassword),
        passwordChangedAt: new Date()
      }
    })
  }

  await ensureCmsInitialized(email)
}

main()
  .catch((error: unknown) => {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2021') {
      throw new Error('Database tables are missing. Run `npm run db:migrate` before running `npm run db:seed`.')
    }

    throw error
  })
  .finally(() => prisma.$disconnect())
