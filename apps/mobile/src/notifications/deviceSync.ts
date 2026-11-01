import { Platform } from 'react-native'
import { apiData } from '@/lib/api'
import { getExpoPushToken } from './token'
import { usePrefsStore } from '@/store/prefs.store'
import { log } from '@/lib/log'
let missingRouteLogged = false
export async function unregisterNotificationDevice(token: string): Promise<void> {
  try {
    await apiData('/api/v1/notifications/devices', { method: 'DELETE', body: JSON.stringify({ token }) }, { authenticated: true })
  } catch (error) {
    if ((error as { status?: number }).status === 404 && !missingRouteLogged) { missingRouteLogged = true; log.debug('Notification device unregister endpoint is not available on this backend') }
  }
}
export async function syncNotificationDevice(userId: string): Promise<void> {
  const previous = usePrefsStore.getState().pushDevice
  if (previous && previous.userId !== userId) await unregisterNotificationDevice(previous.token)
  const { hasNotificationPermission } = await import('./permissions')
  if (!(await hasNotificationPermission())) {
    if (previous?.userId === userId) { await unregisterNotificationDevice(previous.token); usePrefsStore.getState().setPushDevice(null) }
    return
  }
  const token = await getExpoPushToken()
  if (!token) return
  if (previous?.userId === userId && previous.token === token && Date.now() - previous.lastSyncedAt < 7 * 86400000) return
  try {
    await apiData('/api/v1/notifications/devices', { method: 'POST', body: JSON.stringify({ token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' }) }, { authenticated: true })
    usePrefsStore.getState().setPushDevice({ token, userId, lastSyncedAt: Date.now() })
  } catch (error) {
    if ((error as { status?: number }).status === 404 && !missingRouteLogged) { missingRouteLogged = true; log.debug('Notification device sync endpoint is not available on this backend') }
  }
}
