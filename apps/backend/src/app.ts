import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { toNodeHandler } from 'better-auth/node'
import { auth } from '@mydietitian/auth/auth'
import { logger, createHttpLogger } from '@mydietitian/logger'
import { ApiError } from './common/utils/api-error'
import { errorHandler, notFound } from './common/middleware/error.middleware'
import authRouter from './modules/auth/auth.routes'

const isProd = process.env.NODE_ENV === 'production'

const ALLOWED_ORIGINS = [
  process.env.ADMIN_URL,
  ...(isProd ? [] : ['http://localhost:3000']),
].filter(Boolean) as string[]

const app = express()

// 1. HTTP logger first
app.use(
  createHttpLogger(logger, {
    autoLogging: { ignore: (req) => req.url === '/health' },
  })
)

// 2. Trust proxy
app.set('trust proxy', 1)

// 3. Helmet security headers
app.use(helmet())

// 4. CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
      cb(ApiError.forbidden(`Origin ${origin} not allowed`, 'CORS_NOT_ALLOWED'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

// 5. Better Auth handler (before express.json)
app.all('/api/auth/*path', toNodeHandler(auth))

// 6. Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 7. Routes
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/', (_req, res) => res.json({ message: 'Welcome to the MyDietitian Backend' }))

app.use('/api/v1/auth', authRouter)

// 8. 404 handler
app.use(notFound)

// 9. Central error handler (last)
app.use(errorHandler)

export default app
