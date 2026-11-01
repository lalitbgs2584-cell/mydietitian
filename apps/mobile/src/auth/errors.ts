import { ApiClientError } from '@/lib/api'
import { log } from '@/lib/log'

export type AuthField = 'email' | 'password' | 'name'
export type AuthError = { field?: AuthField; message: string; kind: 'field' | 'form' | 'cancelled' }

function getErrorDetails(error: unknown): { code: string; message: string; status?: number; statusText?: string } {
  if (error instanceof ApiClientError) {
    return { code: error.code, message: error.message, status: error.status }
  }
  if (typeof error === 'object' && error !== null) {
    const value = error as Record<string, unknown>
    const body = typeof value.body === 'object' && value.body !== null
      ? value.body as Record<string, unknown>
      : undefined
    return {
      code: typeof value.code === 'string' ? value.code : typeof body?.code === 'string' ? body.code : '',
      message: typeof value.message === 'string' ? value.message : typeof body?.message === 'string' ? body.message : '',
      status: typeof value.status === 'number' ? value.status : typeof value.statusCode === 'number' ? value.statusCode : undefined,
      statusText: typeof value.statusText === 'string' ? value.statusText : undefined,
    }
  }
  return { code: '', message: typeof error === 'string' ? error : '' }
}

export function toAuthError(error: unknown): AuthError {
  const details = getErrorDetails(error)
  const code = details.code.toUpperCase()
  const message = details.message
  const lowerMessage = message.toLowerCase()
  const statusText = details.statusText?.toUpperCase() ?? ''

  if (['ERR_REQUEST_CANCELED', 'ERR_CANCELED', 'USER_CANCELLED', 'USER_CANCELED'].includes(code)
    || lowerMessage.includes('cancelled by user')
    || lowerMessage.includes('canceled by user')
    || statusText === 'CANCELED') {
    return { kind: 'cancelled', message: '' }
  }
  if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
    || lowerMessage.includes('user already exists')) {
    return { kind: 'field', field: 'email', message: 'An account with this email already exists.' }
  }
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || (details.status === 401 && lowerMessage.includes('invalid'))
    || lowerMessage.includes('invalid email or password') || lowerMessage.includes('incorrect password')) {
    return { kind: 'form', message: 'Incorrect email or password.' }
  }
  if (code === 'EMAIL_NOT_VERIFIED' || lowerMessage.includes('email is not verified')
    || lowerMessage.includes('verify your email')) {
    return { kind: 'form', message: 'Please verify your email to continue.' }
  }
  if (['USER_BANNED', 'BANNED_USER'].includes(code) || lowerMessage.includes('banned')) {
    return { kind: 'form', message: 'This account has been suspended. Contact support.' }
  }
  if (details.status === 429 || code === 'TOO_MANY_REQUESTS' || code === 'RATE_LIMITED'
    || lowerMessage.includes('too many')) {
    return { kind: 'form', message: 'Too many attempts. Try again in a minute.' }
  }
  if (code === 'NETWORK' || code === 'TIMEOUT' || lowerMessage.includes('network')
    || lowerMessage.includes('fetch failed') || lowerMessage.includes('timed out')
    || lowerMessage.includes('could not reach')) {
    return { kind: 'form', message: "Can't reach MyDietitian. Check your connection and try again." }
  }
  if ((code === 'BAD_REQUEST' || details.status === 400) && lowerMessage.includes('password')) {
    return { kind: 'field', field: 'password', message }
  }
  if (['ACCOUNT_NOT_LINKED', 'SOCIAL_ACCOUNT_ALREADY_LINKED', 'CREDENTIAL_ACCOUNT_NOT_FOUND'].includes(code)
    || lowerMessage.includes('different sign-in method')
    || lowerMessage.includes('account not linked')) {
    return { kind: 'form', message: 'This email uses a different sign-in method. Try Google or Apple.' }
  }
  if (code === 'USER_NOT_FOUND' || lowerMessage.includes('user not found')) {
    return { kind: 'form', message: 'No account found with that email.' }
  }
  if (details.status === 401 && !code) {
    return { kind: 'form', message: 'Your session expired. Please sign in again.' }
  }
  if (details.status === 403) {
    return { kind: 'form', message: 'This account has been suspended. Contact support.' }
  }
  if (details.status === 500 || details.status === 502 || details.status === 503) {
    return { kind: 'form', message: "MyDietitian is temporarily unavailable. Please try again shortly." }
  }

  log.debug('Unmapped authentication error', { code: code || 'UNKNOWN', status: details.status, message })
  return { kind: 'form', message: message || 'Something went wrong. Please try again.' }
}
