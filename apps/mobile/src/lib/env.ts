import { z } from 'zod'

const publicEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_APPLE_AUTH_ENABLED: z.enum(['true', 'false']).default('false'),
  EXPO_PUBLIC_TERMS_URL: z.string().url().optional().or(z.literal('')),
  EXPO_PUBLIC_PRIVACY_URL: z.string().url().optional().or(z.literal('')),
})

const parsed = publicEnvSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_APPLE_AUTH_ENABLED: process.env.EXPO_PUBLIC_APPLE_AUTH_ENABLED,
  EXPO_PUBLIC_TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL,
  EXPO_PUBLIC_PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_URL,
})

if (!parsed.success) {
  throw new Error(`Invalid mobile environment configuration: ${parsed.error.message}`)
}

export const env = {
  API_URL: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
  APPLE_AUTH_ENABLED: parsed.data.EXPO_PUBLIC_APPLE_AUTH_ENABLED === 'true',
  TERMS_URL: parsed.data.EXPO_PUBLIC_TERMS_URL || undefined,
  PRIVACY_URL: parsed.data.EXPO_PUBLIC_PRIVACY_URL || undefined,
}
