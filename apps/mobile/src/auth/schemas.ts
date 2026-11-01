import { z } from 'zod'
import { passwordSchema } from '@mydietitian/auth/password-policy'

const emailSchema = z.string().trim().email('Enter a valid email address').transform((email) => email.toLowerCase())

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or fewer'),
  email: emailSchema,
  password: passwordSchema,
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
