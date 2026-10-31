import type { Request, Response, NextFunction } from 'express'
import { ApiError, type FieldError } from '../utils/api-error'

type DtoLike = {
  validate(input: unknown): { data: unknown; errors: FieldError[] | null }
}

export const validate = (Dto: DtoLike) => (req: Request, _res: Response, next: NextFunction) => {
  const { data, errors } = Dto.validate(req.body)
  if (errors) throw ApiError.validation(errors)
  req.body = data
  next()
}
