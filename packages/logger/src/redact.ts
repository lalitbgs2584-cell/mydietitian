// Redacted everywhere, including dev
export const ALWAYS_REDACT = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers.x-api-key',
  'authorization',
  'cookie',
  'password',
  '*.password',
  '*.*.password',
  'token',
  '*.token',
  '*.*.token',
  'accessToken',
  '*.accessToken',
  '*.*.accessToken',
  'refreshToken',
  '*.refreshToken',
  '*.*.refreshToken',
  'x-api-key',
  '*.x-api-key',
  '*.*.x-api-key',
]

// Redacted only in production
export const PROD_ONLY_REDACT = [
  'email',
  '*.email',
  '*.*.email',
  'weight',
  '*.weight',
  '*.*.weight',
]
