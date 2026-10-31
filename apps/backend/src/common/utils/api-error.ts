export type FieldError = { field: string; message: string }

type ApiErrorOptions = {
  code?: string
  errors?: FieldError[]
  isOperational?: boolean
  cause?: unknown
}

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly status: 'fail' | 'error'
  public readonly isOperational: boolean
  public readonly code: string
  public readonly errors?: FieldError[]

  constructor(message: string, statusCode: number, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
    this.isOperational = options.isOperational ?? true
    this.code = options.code ?? 'ERROR'
    this.errors = options.errors
    Error.captureStackTrace?.(this, this.constructor)
  }

  static badRequest(message = 'Bad Request', code = 'BAD_REQUEST') {
    return new ApiError(message, 400, { code })
  }
  static validation(errors: FieldError[], message = 'Validation failed') {
    return new ApiError(message, 400, { code: 'VALIDATION_ERROR', errors })
  }
  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, { code })
  }
  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(message, 403, { code })
  }
  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(message, 404, { code })
  }
  static conflict(message = 'Conflict', code = 'CONFLICT') {
    return new ApiError(message, 409, { code })
  }
  static tooManyRequests(message = 'Too Many Requests', code = 'TOO_MANY_REQUESTS') {
    return new ApiError(message, 429, { code })
  }
  static internalServer(message = 'Internal Server Error', cause?: unknown) {
    return new ApiError(message, 500, { code: 'INTERNAL_ERROR', isOperational: false, cause })
  }
}
