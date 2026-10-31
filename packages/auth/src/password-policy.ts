import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
}

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(PASSWORD_REGEX.UPPERCASE, 'Password must contain at least one uppercase letter')
  .regex(PASSWORD_REGEX.LOWERCASE, 'Password must contain at least one lowercase letter')
  .regex(PASSWORD_REGEX.NUMBER, 'Password must contain at least one number')
  .regex(
    PASSWORD_REGEX.SPECIAL,
    'Password must contain at least one special character'
  )

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  const result = passwordSchema.safeParse(password)
  if (result.success) {
    return { isValid: true }
  }
  return { isValid: false, error: result.error.issues[0]?.message ?? 'Invalid password' }
}

