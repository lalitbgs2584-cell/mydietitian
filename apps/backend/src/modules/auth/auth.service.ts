import { auth } from '@mydietitian/auth/auth'
import { APIError } from 'better-auth/api'
import { ApiError } from '../../common/utils/api-error'
import { authRepository, type SafeUser } from './auth.repository'

export interface AuthResult<T = unknown> {
  data: T
  headers?: Headers
}

export class AuthService {
  async register(
    input: { name: string; email: string; password: string },
    headers: Headers
  ): Promise<AuthResult> {
    const res = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email.toLowerCase().trim(),
        password: input.password,
      },
      headers,
      returnHeaders: true,
    })

    const data = (res as Record<string, unknown>)?.response ?? (res as Record<string, unknown>)?.data ?? res
    const responseHeaders = (res as Record<string, unknown>)?.headers as Headers | undefined
    return { data, headers: responseHeaders }
  }

  async login(
    input: { email: string; password: string },
    headers: Headers
  ): Promise<AuthResult> {
    const res = await auth.api.signInEmail({
      body: {
        email: input.email.toLowerCase().trim(),
        password: input.password,
      },
      headers,
      returnHeaders: true,
    })

    const data = (res as Record<string, unknown>)?.response ?? (res as Record<string, unknown>)?.data ?? res
    const responseHeaders = (res as Record<string, unknown>)?.headers as Headers | undefined

    const user = (data as { user?: { banned?: boolean | null } })?.user
    if (user?.banned) {
      throw ApiError.forbidden('Your account has been banned', 'USER_BANNED')
    }

    return { data, headers: responseHeaders }
  }

  async logout(headers: Headers): Promise<AuthResult> {
    const res = await auth.api.signOut({
      headers,
      returnHeaders: true,
    })

    const data = (res as Record<string, unknown>)?.response ?? (res as Record<string, unknown>)?.data ?? res
    const responseHeaders = (res as Record<string, unknown>)?.headers as Headers | undefined
    return { data, headers: responseHeaders }
  }

  async forgotPassword(
    email: string,
    headers: Headers
  ): Promise<{ message: string }> {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: email.toLowerCase().trim(),
          redirectTo: '/reset-password',
        },
        headers,
      })
    } catch {
      // Suppress any errors to prevent user enumeration
    }

    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
    }
  }

  async resetPassword(
    input: { token: string; newPassword: string },
    headers: Headers
  ): Promise<AuthResult> {
    try {
      const res = await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword,
        },
        headers,
        returnHeaders: true,
      })

      const data = (res as Record<string, unknown>)?.response ?? (res as Record<string, unknown>)?.data ?? res
      const responseHeaders = (res as Record<string, unknown>)?.headers as Headers | undefined
      return { data, headers: responseHeaders }
    } catch (err) {
      if (
        err instanceof APIError ||
        (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'APIError')
      ) {
        throw ApiError.badRequest('Invalid or expired password reset token', 'INVALID_OR_EXPIRED_TOKEN')
      }
      throw err
    }
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await authRepository.findUserById(userId)
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND')
    }
    return user
  }
}

export const authService = new AuthService()

