import { z } from 'zod'
import { BaseDto } from '../../../common/dto/base.dto'
import { passwordSchema } from '@mydietitian/auth/password-policy'

export class ResetPasswordDto extends BaseDto {
  static override schema = z.object({
    token: z.string().min(1, 'Token is required').trim(),
    newPassword: passwordSchema,
  })
}

export default ResetPasswordDto
