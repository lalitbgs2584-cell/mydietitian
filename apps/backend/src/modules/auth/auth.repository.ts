import { prisma } from '@mydietitian/db'

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  emailVerified: true,
  image: true,
  banned: true,
  createdAt: true,
  updatedAt: true,
} as const

export type SafeUser = {
  id: string
  name: string | null
  email: string
  role: string | null
  emailVerified: boolean
  image: string | null
  banned: boolean | null
  createdAt: Date
  updatedAt: Date
}

export class AuthRepository {
  async findUserById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    })
  }

  async findUserByEmail(email: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: safeUserSelect,
    })
  }

  async listSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
      },
    })
  }
}

export const authRepository = new AuthRepository()
