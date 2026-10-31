import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '@mydietitian/auth/auth'
import { ROLES, type Role } from '@mydietitian/auth/roles'
import { ApiError } from '../utils/api-error'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  emailVerified: boolean
  banned?: boolean | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: Date
  token: string
  [key: string]: unknown
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      session?: AuthSession
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!sessionData || !sessionData.user) {
      throw ApiError.unauthorized('Authentication required', 'UNAUTHENTICATED')
    }

    if (sessionData.user.banned) {
      throw ApiError.forbidden('Your account has been banned', 'USER_BANNED')
    }

    req.user = sessionData.user as unknown as AuthUser
    req.session = sessionData.session as unknown as AuthSession
    res.locals.userId = sessionData.user.id

    next()
  } catch (err) {
    next(err)
  }
}

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'UNAUTHENTICATED'))
    }

    const userRole = (req.user.role ?? ROLES.USER) as Role
    if (!roles.includes(userRole)) {
      return next(ApiError.forbidden('Insufficient permissions', 'FORBIDDEN'))
    }

    next()
  }
}

export const requireAuth = authenticate
export const requireRole = (...roles: Role[]) => [authenticate, authorize(...roles)]
