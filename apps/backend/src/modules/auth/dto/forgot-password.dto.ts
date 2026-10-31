import { z } from 'zod'
import { BaseDto } from '../../../common/dto/base.dto'

export class ForgotPasswordDto extends BaseDto {
  static override schema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
  })
}

export default ForgotPasswordDto

