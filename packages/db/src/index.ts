import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient,Prisma } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
 const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 30_000,
      max: 10,
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}


export { prisma , Prisma }