import { createAuthClient } from 'better-auth/react'
import { expoClient } from '@better-auth/expo/client'
import * as SecureStore from 'expo-secure-store'
import { env } from '@/lib/env'

export const authClient = createAuthClient({
  baseURL: env.API_URL,
  plugins: [expoClient({ scheme: 'mydietitian', storagePrefix: 'mydietitian', storage: SecureStore })],
})

export type AuthSession = NonNullable<ReturnType<typeof authClient.useSession>['data']>
export type SessionUser = AuthSession['user']

export async function getSessionUser(): Promise<SessionUser | null> {
  const result = await authClient.getSession()
  if (result.error) throw result.error
  return result.data?.user ?? null
}

export async function getSessionCookie(): Promise<string> {
  return authClient.getCookie()
}
