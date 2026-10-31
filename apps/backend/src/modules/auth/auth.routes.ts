import { Router } from 'express'
import { validate } from '../../common/middleware/validate.middleware'
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware'
import { ROLES } from '@mydietitian/auth/roles'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { authController } from './auth.controller'

const router = Router()

router.post('/register', validate(RegisterDto), (req, res, next) =>
  authController.register(req, res, next)
)

router.post('/login', validate(LoginDto), (req, res, next) => authController.login(req, res, next))

router.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next))

router.post('/forgot-password', validate(ForgotPasswordDto), (req, res, next) =>
  authController.forgotPassword(req, res, next)
)

router.post('/reset-password', validate(ResetPasswordDto), (req, res, next) =>
  authController.resetPassword(req, res, next)
)

router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next))

router.get('/admin-check', ...requireRole(ROLES.ADMIN), (req, res, next) =>
  authController.adminCheck(req, res, next)
)

export default router
