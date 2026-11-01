import * as Haptics from 'expo-haptics'
import { authClient } from '@/auth/client'
import { ApiClientError, apiData, resetSessionExpiredFlow } from '@/lib/api'
import { usePrefsStore, type AuthMethod } from '@/store/prefs.store'
import type { MeResponse } from '@/auth/hooks/useMe'
import { toAuthError } from '@/auth/errors'

export async function rememberAuthenticatedUser(userId: string, method: AuthMethod, defaultOnboarded: boolean): Promise<void> {
  const prefs = usePrefsStore.getState()
  const previous = prefs.lastKnownUser?.userId === userId ? prefs.lastKnownUser : null
  prefs.setLastAuthMethod(method)
  prefs.setLastKnownUser({ userId, onboarded: previous?.onboarded ?? defaultOnboarded })
  resetSessionExpiredFlow()

  void apiData<MeResponse>('/api/v1/auth/me', undefined, { authenticated: true, timeoutMs: 6_000 })
    .then((me) => {
      const onboarded = me.onboarded ?? previous?.onboarded ?? defaultOnboarded
      usePrefsStore.getState().setLastKnownUser({ userId, onboarded })
    })
    .catch(() => undefined)
}

export async function successHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } catch {
    // Haptics are optional and may be unavailable on some devices.
  }
}

export async function failureHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  } catch {
    // Haptics are optional and may be unavailable on some devices.
  }
}

export function mapAuthError(error: unknown) {
  return toAuthError(error)
}

export async function getCurrentSessionUserId(): Promise<string | null> {
  const result = await authClient.getSession()
  return result.data?.user.id ?? null
}
