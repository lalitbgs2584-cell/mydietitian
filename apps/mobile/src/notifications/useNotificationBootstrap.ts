import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import type { AuthStatus } from '@/auth/useAuthStatus'
import { authClient } from '@/auth/client'
import { syncNotificationDevice } from './deviceSync'
import { setupNotificationChannels } from './channels'
import { notificationRoute } from './routing'
import './handler'

export function useNotificationBootstrap(status: AuthStatus): void {
  const router = useRouter()
  const session = authClient.useSession()
  const queued = useRef<unknown>(null)
  useEffect(() => { void setupNotificationChannels() }, [])
  useEffect(() => {
    const userId = session.data?.user.id
    if (status === 'ready' && userId) void syncNotificationDevice(userId)
  }, [session.data?.user.id, status])
  useEffect(() => {
    const handle = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification.request.content.data
      const route = notificationRoute(data)
      if (!route) return
      if (status !== 'ready') queued.current = route
      else router.push(route as never)
      void Notifications.clearLastNotificationResponseAsync()
    }
    void Notifications.getLastNotificationResponseAsync().then(handle)
    const sub = Notifications.addNotificationResponseReceivedListener(handle)
    return () => sub.remove()
  }, [router, status])
  useEffect(() => {
    if (status === 'ready' && queued.current) { router.push(queued.current as never); queued.current = null }
  }, [router, status])
}
