import { authClient } from '@/auth/client'
import { queryClient } from '@/lib/query-client'
import { usePrefsStore, type AuthNotice } from '@/store/prefs.store'
import { log } from '@/lib/log'
import { unregisterNotificationDevice } from '@/notifications/deviceSync'

export async function clearLocalUserSession(notice: AuthNotice): Promise<void> {
  if (notice && usePrefsStore.getState().authNotice === notice) return
  try {
    const device = usePrefsStore.getState().pushDevice
    if (device) await unregisterNotificationDevice(device.token)
    const result = await authClient.signOut()
    if (result.error) log.debug('Local auth sign-out returned an error')
  } catch {
    log.debug('Local auth sign-out could not reach the server')
  }
  queryClient.clear()
  usePrefsStore.getState().clearUserScopedData()
  if (notice) usePrefsStore.getState().setAuthNotice(notice)
}
