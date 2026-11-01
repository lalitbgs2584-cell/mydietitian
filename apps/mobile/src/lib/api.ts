import { getSessionCookie } from '@/auth/client'
import { env } from '@/lib/env'

const API_BASE_URL = env.API_URL

export type ApiFieldError = { field?: string; message: string }
export type ApiClientErrorCode = 'NETWORK' | 'TIMEOUT' | string

type ApiErrorBody = {
  success?: false
  message?: string
  code?: string
  errors?: ApiFieldError[]
}

type ApiEnvelope<T> = {
  success: true
  message?: string
  data: T
}

type ApiOptions = {
  authenticated?: boolean
  timeoutMs?: number
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: ApiClientErrorCode
  readonly fieldErrors?: ApiFieldError[]

  constructor(status: number, code: ApiClientErrorCode, message: string, fieldErrors?: ApiFieldError[]) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

const DEFAULT_TIMEOUT_MS = 15_000
let sessionExpiredHandler: (() => void | Promise<void>) | undefined
let expirationInProgress = false

export function setSessionExpiredHandler(handler: () => void | Promise<void>): void {
  sessionExpiredHandler = handler
}

export function resetSessionExpiredFlow(): void {
  expirationInProgress = false
}

async function handleUnauthenticated(): Promise<void> {
  if (expirationInProgress) return
  expirationInProgress = true
  try {
    await sessionExpiredHandler?.()
  } catch {
    // The next app interaction can retry local cleanup; never mask the API error.
  }
}

function errorFromBody(status: number, body: unknown): ApiClientError {
  const record = typeof body === 'object' && body !== null ? body as ApiErrorBody : {}
  return new ApiClientError(
    status,
    record.code ?? `HTTP_${status}`,
    record.message ?? `Request failed with status ${status}.`,
    record.errors,
  )
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]).catch(() => fallback)
}

export async function api<T>(path: string, init?: RequestInit, options: ApiOptions = {}): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const headers = new Headers(init?.headers)

  try {
    if (init?.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    if (options.authenticated) {
      const cookie = await getSessionCookie()
      if (cookie) headers.set('Cookie', cookie)
    }
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
      credentials: options.authenticated ? 'omit' : init?.credentials,
    })
    const body: unknown = await response.json().catch(() => undefined)

    if (!response.ok) {
      const error = errorFromBody(response.status, body)
      if (options.authenticated && response.status === 401 && error.code === 'UNAUTHENTICATED') {
        void handleUnauthenticated()
      }
      throw error
    }

    return body as T
  } catch (error) {
    if (error instanceof ApiClientError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError(0, 'TIMEOUT', 'The request timed out.')
    }
    throw new ApiClientError(0, 'NETWORK', 'The request could not reach the server.')
  } finally {
    clearTimeout(timeout)
  }
}

export async function apiData<T>(path: string, init?: RequestInit, options?: ApiOptions): Promise<T> {
  const envelope = await api<ApiEnvelope<T> | ApiErrorBody>(path, init, options)
  if (typeof envelope !== 'object' || envelope === null || !('success' in envelope) || envelope.success !== true) {
    throw errorFromBody(200, envelope)
  }
  return envelope.data
}

export function warmUp(): void {
  api('/health').catch(() => undefined)
}
