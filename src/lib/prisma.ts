import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://build:build@localhost:5432/build'
const adapter = new PrismaPg({ connectionString })

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL)
