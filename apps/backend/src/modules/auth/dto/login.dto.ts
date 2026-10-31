import { z } from 'zod'
import { BaseDto } from '../../../common/dto/base.dto'

export class LoginDto extends BaseDto {
  static override schema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
}

export default LoginDto

