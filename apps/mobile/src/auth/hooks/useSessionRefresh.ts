import { useCallback, useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { authClient } from '@/auth/client'
import { clearLocalUserSession } from '@/auth/session'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function useSessionRefresh(): void {
  const session = authClient.useSession()
  const hasSession = Boolean(session.data?.user)
  const hadSession = useRef(hasSession)
  const lastCheckAt = useRef(Date.now())

  hadSession.current = hasSession

  const expireSession = useCallback(() => clearLocalUserSession('expired'), [])

  useEffect(() => {
    const onAppStateChange = async (state: AppStateStatus) => {
      if (state !== 'active' || Date.now() - lastCheckAt.current < REFRESH_INTERVAL_MS) return
      lastCheckAt.current = Date.now()
      const wasSignedIn = hadSession.current
      if (!wasSignedIn) return

      try {
        const result = await authClient.getSession()
        if (result.error) {
          const status = result.error.status
          if (status === 401) await expireSession()
          return
        }
        if (!result.data?.user && wasSignedIn) {
          await expireSession()
          return
        }
        hadSession.current = Boolean(result.data?.user)
      } catch {
        // Network and server failures do not invalidate a cached local session.
      }
    }

    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [expireSession])
}
