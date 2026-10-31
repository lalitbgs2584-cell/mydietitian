import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthMiddleware, APIError } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { expo } from '@better-auth/expo'
import { prisma } from '@mydietitian/db'
import { getLogger } from '@mydietitian/logger'
import { ROLES } from './roles'
import { required } from './utils/required'
import { validatePassword } from './password-policy'

const isProd = process.env.NODE_ENV === 'production'
const authLogger = getLogger('auth')

export const auth = betterAuth({
  baseURL: required('BETTER_AUTH_URL'),
  secret: required('BETTER_AUTH_SECRET'),

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async (data, _request) => {
      // TODO: send password-reset email to user here (user.email, url, token). Email provider will be added later.
      if (process.env.NODE_ENV === 'development') {
        authLogger.debug({ email: data.user.email, url: data.url }, 'Password reset URL generated')
      }
    },
  },

  emailVerification: {
    sendVerificationEmail: async (data, _request) => {
      // TODO: send verification email to user here
      if (process.env.NODE_ENV === 'development') {
        authLogger.debug(
          { email: data.user.email, url: data.url },
          'Email verification URL generated'
        )
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  rateLimit: {
    enabled: isProd,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email' || ctx.path.endsWith('/sign-up/email')) {
        const password = (ctx.body as Record<string, unknown> | undefined)?.password
        if (typeof password === 'string') {
          const { isValid, error } = validatePassword(password)
          if (!isValid) {
            throw new APIError('BAD_REQUEST', {
              message: error || 'Password does not meet requirements',
            })
          }
        }
      }
      if (ctx.path === '/reset-password' || ctx.path.endsWith('/reset-password')) {
        const password = (ctx.body as Record<string, unknown> | undefined)?.newPassword
        if (typeof password === 'string') {
          const { isValid, error } = validatePassword(password)
          if (!isValid) {
            throw new APIError('BAD_REQUEST', {
              message: error || 'Password does not meet requirements',
            })
          }
        }
      }
    }),
  },

  onAPIError: {
    onError: (error, ctx) => {
      authLogger.error(
        {
          err: error,
          path: (ctx as { path?: string })?.path,
        },
        'Better Auth API error'
      )
    },
  },

  // Social providers are only turned on if their env vars exist
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    // ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
    //   ? {
    //       apple: {
    //         clientId: process.env.APPLE_CLIENT_ID,
    //         clientSecret: process.env.APPLE_CLIENT_SECRET,
    //         appBundleIdentifier: process.env.APPLE_APP_BUNDLE_ID, // needed for native Apple sign-in
    //       },
    //     }
    //   : {}),
  },

  // Who is allowed to talk to this auth server
  trustedOrigins: [
    required('MOBILE_SCHEME'), // e.g. "mydietitian://"
    required('ADMIN_URL'), // e.g. "https://admin.yourapp.com"
    ...(isProd ? [] : ['exp://']), // Expo Go / dev client in development
  ],

  plugins: [
    admin({
      defaultRole: ROLES.USER,
      adminRoles: [ROLES.ADMIN],
    }),
    expo(),
  ],

  advanced: {
    useSecureCookies: isProd,
    ...(process.env.COOKIE_DOMAIN
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: process.env.COOKIE_DOMAIN, // e.g. ".yourapp.com"
          },
        }
      : {}),
  },
})

// Type-only export. Clients can use `import type { Auth }` safely.
export type Auth = typeof auth
