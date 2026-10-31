import { randomUUID } from 'node:crypto'
import pino, { type Logger, type LoggerOptions } from 'pino'
import pretty from 'pino-pretty'
import pinoHttp, { type HttpLogger, type Options as PinoHttpOptions } from 'pino-http'
import { ALWAYS_REDACT, PROD_ONLY_REDACT } from './redact'
import { config } from './config/config'

export interface CreateLoggerOptions {
  service: string
  level?: string
  env?: string
  redact?: string[]
  options?: Partial<LoggerOptions>
}

export function createLogger({
  service,
  level,
  env,
  redact = [],
  options: customOptions,
}: CreateLoggerOptions): Logger {
  const currentEnv = env ?? process.env.NODE_ENV ?? config.env
  const currentLogLevel = level ?? process.env.LOG_LEVEL ?? config.logLevel
  const isProduction = currentEnv === 'production'

  const defaultRedactPaths = isProduction ? [...ALWAYS_REDACT, ...PROD_ONLY_REDACT] : ALWAYS_REDACT

  const options: LoggerOptions = {
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
    ...customOptions,
    level: currentLogLevel,
    base: { service, env: currentEnv },
    redact: {
      paths: [...defaultRedactPaths, ...redact],
      censor: '[REDACTED]',
    },
  }

  // pino throws if both `transport` and a destination stream are given
  if (options.transport) return pino(options)

  // Production: plain JSON to stdout
  if (isProduction) return pino(options)

  // Development: pretty output (pretty stream needs default numeric levels)
  delete options.formatters
  delete options.timestamp
  return pino(
    options,
    pretty({
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname,service,env',
      sync: true,
    })
  )
}

// ---------------------------------------------------------------------------
// HTTP request logging
// ---------------------------------------------------------------------------

const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS ?? 1000)

const SENSITIVE_QUERY_KEYS = new Set([
  'token', 'access_token', 'refresh_token', 'code',
  'password', 'key', 'api_key', 'secret', 'signature', 'x-api-key',
])

export function getModuleFromUrl(url: string | undefined): string {
  if (!url) return 'root'
  const path = url.split('?')[0] || ''
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return 'root'
  let i = 0
  if (segments[i] === 'api') i++
  if (segments[i] && /^v\d+$/i.test(segments[i]!)) i++
  return segments[i] || 'root'
}

export function sanitizeUrl(url: string | undefined): string {
  if (!url) return ''
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return url

  const path = url.slice(0, queryStart)
  const params = new URLSearchParams(url.slice(queryStart + 1))
  for (const key of [...params.keys()]) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) params.set(key, '[REDACTED]')
  }
  return `${path}?${params.toString()}`
}

const REQUEST_ID_PATTERN = /^[\w.-]{1,128}$/
const START = Symbol('requestStartNs')
type Stamped = { [START]?: bigint }

// Express-only fields typed locally (this package has no express dependency)
type ExpressReq = { originalUrl?: string; url?: string }
type ExpressRes = { locals?: Record<string, unknown> }
const urlOf = (req: unknown): string => {
  const r = req as ExpressReq
  return sanitizeUrl(r.originalUrl ?? r.url)
}

const elapsedMs = (req: object): number => {
  const start = (req as Stamped)[START]
  return start ? Number(process.hrtime.bigint() - start) / 1e6 : 0
}

export function createHttpLogger(
  serviceOrLogger: string | Logger,
  options?: PinoHttpOptions
): HttpLogger {
  const loggerInstance =
    typeof serviceOrLogger === 'string'
      ? createLogger({ service: serviceOrLogger })
      : serviceOrLogger

  return pinoHttp({
    logger: loggerInstance,

    genReqId: (req, res) => {
      ;(req as Stamped)[START] = process.hrtime.bigint()
      const incoming = req.headers['x-request-id']
      const id =
        typeof incoming === 'string' && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID()
      res.setHeader('x-request-id', id)
      return id
    },

    customAttributeKeys: { responseTime: 'durationMs' },

    customLogLevel: (req, res, err) => {
      const error = err ?? (res as any).err
      if (error || res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      if (elapsedMs(req) > SLOW_REQUEST_MS) return 'warn'
      return 'info'
    },

    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${urlOf(req)} ${res.statusCode} ${Math.round(responseTime)}ms`,

    customErrorMessage: (req, res) => `${req.method} ${urlOf(req)} ${res.statusCode} failed`,

    customProps: (req, res) => {
      const locals = (res as ExpressRes).locals ?? {}
      const raw = (req as any).raw ?? req
      const url = (raw as ExpressReq).originalUrl ?? (raw as ExpressReq).url ?? (req as any).url
      const mod = getModuleFromUrl(url)
      return {
        module: mod,
        ...(locals.errorCode ? { errorCode: locals.errorCode } : {}),
        ...(locals.userId ? { userId: locals.userId } : {}),
        ...(elapsedMs(req) > SLOW_REQUEST_MS ? { slow: true } : {}),
      }
    },

    serializers: {
      req: (req) => {
        const raw = req.raw ?? req
        return {
          id: req.id,
          method: req.method,
          url: sanitizeUrl(raw.originalUrl ?? req.url),
          ip: raw.ip ?? req.remoteAddress,
          userAgent: req.headers?.['user-agent'],
        }
      },
      res: (res) => ({ statusCode: res.statusCode }),
    },

    ...options,
  })
}

// ---------------------------------------------------------------------------
// Service / function latency
// ---------------------------------------------------------------------------

export async function timed<T>(
  log: Logger,
  operation: string,
  fn: () => Promise<T>,
  meta: Record<string, unknown> = {}
): Promise<T> {
  const start = process.hrtime.bigint()
  const durationMs = () => Math.round((Number(process.hrtime.bigint() - start) / 1e6) * 100) / 100

  try {
    const result = await fn()
    const ms = durationMs()
    log[ms > SLOW_REQUEST_MS ? 'warn' : 'debug']({ operation, durationMs: ms, ...meta }, `${operation} done`)
    return result
  } catch (err) {
    log.error({ err, operation, durationMs: durationMs(), ...meta }, `${operation} failed`)
    throw err
  }
}