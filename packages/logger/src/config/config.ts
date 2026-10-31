import 'dotenv/config'

export const config = {
  get env(): string {
    return process.env.NODE_ENV ?? 'development'
  },
  get logLevel(): string {
    return process.env.LOG_LEVEL ?? 'info'
  },
}

export const getIsProd = (): boolean => (process.env.NODE_ENV ?? 'development') === 'production'

export const getIsDev = (): boolean => (process.env.NODE_ENV ?? 'development') === 'development'

export const isProd = (process.env.NODE_ENV ?? 'development') === 'production'
export const isDev = (process.env.NODE_ENV ?? 'development') === 'development'
