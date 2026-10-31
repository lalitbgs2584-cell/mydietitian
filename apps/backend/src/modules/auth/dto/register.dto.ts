import { z } from 'zod'
import { BaseDto } from '../../../common/dto/base.dto'
import { passwordSchema } from '@mydietitian/auth/password-policy'

export class RegisterDto extends BaseDto {
  static override schema = z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .trim(),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: passwordSchema,
  })
}

export default RegisterDto
