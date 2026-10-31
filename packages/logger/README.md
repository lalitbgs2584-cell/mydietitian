# @mydietitian/logger

Production-ready structured logging for the MyDietitian platform, powered by Pino.

## Features

- **Pino & Pino-HTTP**: High-performance structured logging.
- **Environment adaptive**: Plain JSON to stdout with ISO timestamps in production; colorized sync `pino-pretty` in development.
- **Single-line HTTP request logs**: Logs `req.id`, `method`, sanitized `url`, `ip`, `userAgent`, `res.statusCode`, `durationMs`, `module`, `errorCode`, `userId`, and `slow: true`.
- **Automatic redaction**: Masking sensitive data (`password`, `token`, `cookie`, `authorization`, `x-api-key`, etc.).

## Exports

### `getLogger(module: string)`

Creates a child logger that automatically tags every log line with `module: '<module>'`:

```ts
import { getLogger } from '@mydietitian/logger'

const authLog = getLogger('auth')
authLog.info({ userId: 'u_123' }, 'User signed in')
```

### `timed(log, operation, fn, meta)`

Measures and logs execution time of an asynchronous operation, logging `warn` if duration exceeds `SLOW_REQUEST_MS` (default: 1000ms), and rethrows any caught error:

```ts
import { logger, timed } from '@mydietitian/logger'

const result = await timed(
  logger,
  'fetchExternalData',
  async () => {
    return await fetch('https://api.example.com/data')
  },
  { targetId: '123' }
)
```

### `createHttpLogger(serviceOrLogger, options)`

Express middleware for HTTP request logging.

### `createLogger(options)`

Custom logger factory.
