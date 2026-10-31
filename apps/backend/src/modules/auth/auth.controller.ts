import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import ApiResponse from '../../common/utils/api-response'
import { authService } from './auth.service'

function applySetCookieHeaders(res: Response, headers?: Headers): void {
  if (!headers) return
  const getSetCookie = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie
  if (typeof getSetCookie === 'function') {
    const cookies = getSetCookie.call(headers)
    if (cookies && cookies.length > 0) {
      res.setHeader('set-cookie', cookies)
      return
    }
  }
  const cookie = headers.get('set-cookie')
  if (cookie) {
    res.setHeader('set-cookie', cookie)
  }
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body, fromNodeHeaders(req.headers))
      applySetCookieHeaders(res, result.headers)
      return ApiResponse.created(res, 'User registered successfully', result.data)
    } catch (err) {
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body, fromNodeHeaders(req.headers))
      applySetCookieHeaders(res, result.headers)
      return ApiResponse.ok(res, 'Login successful', result.data)
    } catch (err) {
      next(err)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout(fromNodeHeaders(req.headers))
      applySetCookieHeaders(res, result.headers)
      return ApiResponse.ok(res, 'Logged out successfully', null)
    } catch (err) {
      next(err)
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email, fromNodeHeaders(req.headers))
      return ApiResponse.ok(res, result.message, null)
    } catch (err) {
      next(err)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body, fromNodeHeaders(req.headers))
      applySetCookieHeaders(res, result.headers)
      return ApiResponse.ok(res, 'Password reset successfully', null)
    } catch (err) {
      next(err)
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id)
      return ApiResponse.ok(res, 'Current user retrieved successfully', user)
    } catch (err) {
      next(err)
    }
  }

  async adminCheck(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.ok(res, 'Admin access granted', { user: req.user })
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()

