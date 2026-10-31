import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { APIError } from 'better-auth/api'
import { Prisma } from '@mydietitian/db'
import { ApiError } from '../utils/api-error'

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const toError = (err: unknown): Error => (err instanceof Error ? err : new Error(String(err)))

/** Normalize anything that gets thrown into an ApiError. */
export const toApiError = (err: unknown): ApiError => {
  if (err instanceof ApiError) return err

  if (err instanceof ZodError) {
    return ApiError.validation(
      err.issues.map((i) => ({ field: i.path.map(String).join('.'), message: i.message }))
    )
  }

  if (err instanceof APIError || (isObj(err) && err.name === 'APIError')) {
    const apiErr = err as {
      statusCode?: number
      status?: string | number
      message?: string
      body?: unknown
    }
    const statusCode = typeof apiErr.statusCode === 'number' ? apiErr.statusCode : 400
    const code =
      isObj(apiErr.body) && typeof apiErr.body.code === 'string'
        ? apiErr.body.code
        : typeof apiErr.status === 'string'
          ? apiErr.status
          : 'API_ERROR'
    return new ApiError(apiErr.message || 'Authentication error', statusCode, { code })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002')
      return new ApiError('Resource already exists', 409, { code: 'DUPLICATE_RESOURCE' })
    if (err.code === 'P2025') return ApiError.notFound('Resource not found', 'RESOURCE_NOT_FOUND')
    if (err.code === 'P2003') return ApiError.badRequest('Invalid reference', 'INVALID_REFERENCE')
  }

  if (isObj(err) && err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Invalid JSON body', 'INVALID_JSON')
  }
  if (isObj(err) && err.type === 'entity.too.large') {
    return new ApiError('Payload too large', 413, { code: 'PAYLOAD_TOO_LARGE' })
  }

  return ApiError.internalServer(undefined, err)
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(
    ApiError.notFound(
      `Route ${req.method} ${req.originalUrl.split('?')[0]} not found`,
      'ROUTE_NOT_FOUND'
    )
  )
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const error = toApiError(err)
  res.locals.errorCode = error.code // appears as `errorCode` on the request log line

  // 5xx or a bug: attach the original error so the log line has the stack
  if (error.statusCode >= 500 || !error.isOperational) {
    res.err = toError(err)
  }

  // Response already started: let Express close the connection
  if (res.headersSent) return next(err)

  const requestId =
    (req.id as string | undefined) ?? (req.headers['x-request-id'] as string | undefined)

  res.status(error.statusCode).json({
    status: error.status,
    code: error.code,
    message: error.message,
    requestId,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err instanceof Error ? err.stack : error.stack,
    }),
  })
}
