import { createHttpLogger, createLogger, timed } from './logger'

export * from './logger'
export * from './redact'
export { default as pino } from 'pino'
export type { Logger, LoggerOptions, Level } from 'pino'

export const logger = Object.assign(
  createLogger({ service: process.env.SERVICE_NAME ?? 'backend' }),
  { createLogger, createHttpLogger, timed }
)

/** Module-scoped child logger: every line carries `module: '<name>'`. */
export const getLogger = (module: string) => logger.child({ module })

export default logger