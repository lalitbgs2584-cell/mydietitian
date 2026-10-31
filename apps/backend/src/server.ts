import logger from '@mydietitian/logger'
import app from './app'
import { Config } from './common/config/Config'
import { prisma } from '@mydietitian/db'

let isShuttingDown = false

const server = app.listen(Config.PORT, () => {
  logger.info({ port: Config.PORT, env: Config.NODE_ENV }, 'Server started')
})

// Correct way to catch startup errors, e.g. port already in use
server.on('error', (err) => {
  logger.fatal({ err }, 'Failed to start server')
  process.exit(1)
})

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
  // Prevent multiple shutdowns from SIGTERM + SIGINT + errors
  if (isShuttingDown) return
  isShuttingDown = true

  logger.info({ signal }, 'Shutting down')

  // Force exit if graceful shutdown takes too long
  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out; forcing exit')
    process.exit(1)
  }, 10_000)

  // This timer should not keep the Node process alive by itself
  forceExitTimer.unref()

  try {
    // 1. Stop accepting new HTTP requests
    // 2. Wait for in-flight requests to finish
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // 3. Close database connections only after HTTP work is done
    await prisma.$disconnect()

    clearTimeout(forceExitTimer)

    logger.info('Shutdown complete')
    process.exit(exitCode)
  } catch (err) {
    logger.error({ err }, 'Error occurred during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection')
  void shutdown('unhandledRejection', 1)
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')

  // Do not attempt full async cleanup after an uncaught exception.
  // The process may be in an unsafe state.
  process.exit(1)
})
