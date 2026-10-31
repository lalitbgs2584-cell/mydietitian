import { z } from 'zod'
import type { FieldError } from '../utils/api-error'

export type ValidationResult<T> = { data: T; errors: null } | { data: null; errors: FieldError[] }

export class BaseDto {
  // Child DTOs must override this
  protected static schema: z.ZodType

  static validate<S extends z.ZodType>(
    this: { schema: S },
    input: unknown
  ): ValidationResult<z.output<S>> {
    const result = this.schema.safeParse(input)

    if (!result.success) {
      return {
        data: null,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
      }
    }

    return { data: result.data, errors: null }
  }
}
