import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { authClient } from '@/auth/client'
import { resetSessionExpiredFlow } from '@/lib/api'
import { log } from '@/lib/log'
import { usePrefsStore } from '@/store/prefs.store'

export function useSignOut() {
  return useCallback(async () => {
    const device = usePrefsStore.getState().pushDevice
    if (device) {
      try {
        await api('/api/v1/notifications/devices', {
          method: 'DELETE',
          body: JSON.stringify({ expoPushToken: device.token }),
        }, { authenticated: true, timeoutMs: 3_000 })
      } catch {
        // Push-device routes are not available on the current backend yet.
      }
    }

    try {
      const result = await authClient.signOut()
      if (result.error) log.debug('Sign-out request did not complete')
    } catch {
      log.debug('Sign-out request failed; clearing local app state')
    }

    await Promise.allSettled([
      Notifications.cancelAllScheduledNotificationsAsync(),
      Notifications.dismissAllNotificationsAsync(),
      Notifications.setBadgeCountAsync(0),
    ])
    queryClient.clear()
    usePrefsStore.getState().clearUserScopedData()
    resetSessionExpiredFlow()
    try {
      await Haptics.selectionAsync()
    } catch {
      // Haptics are optional and may be unavailable on some devices.
    }
  }, [])
}
