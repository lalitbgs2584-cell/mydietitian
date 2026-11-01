import { useEffect, useRef, useState } from 'react'
import { authClient, getSessionCookie } from '@/auth/client'
import { clearLocalUserSession } from '@/auth/session'
import { ApiClientError } from '@/lib/api'
import { useMe } from '@/auth/hooks/useMe'
import { usePrefsStore } from '@/store/prefs.store'

export type AuthStatus = 'booting' | 'signedOut' | 'needsOnboarding' | 'ready'

function isBanned(error: unknown): boolean {
  return error instanceof ApiClientError && (error.status === 403 || error.code === 'USER_BANNED' || error.code === 'BANNED_USER')
}

export function useAuthStatus(): AuthStatus {
  const session = authClient.useSession()
  const user = session.data?.user
  const userId = user?.id
  const preferencesHydrated = usePrefsStore((state) => state.hydrated)
  const me = useMe(preferencesHydrated ? userId : undefined)
  const lastKnownUser = usePrefsStore((state) => state.lastKnownUser)
  const setLastKnownUser = usePrefsStore((state) => state.setLastKnownUser)
  const [cachedCookiePresent, setCachedCookiePresent] = useState<boolean | null>(null)
  const handledBanned = useRef(false)
  const handledUnauthorized = useRef(false)

  useEffect(() => {
    let mounted = true
    getSessionCookie()
      .then((cookie) => { if (mounted) setCachedCookiePresent(cookie.length > 0) })
      .catch(() => { if (mounted) setCachedCookiePresent(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!userId || !me.data) return
    const current = usePrefsStore.getState().lastKnownUser
    const locallyNeedsOnboarding = current !== null && current.userId === userId && !current.onboarded
    const targetOnboarded = me.data.onboarded === undefined ? !locallyNeedsOnboarding : me.data.onboarded
    if (current?.userId === userId && current?.onboarded === targetOnboarded) {
      return
    }
    usePrefsStore.getState().setLastKnownUser({
      userId,
      onboarded: targetOnboarded,
    })
  }, [me.data, userId])

  useEffect(() => {
    if (session.error?.status !== 401 || !cachedCookiePresent || handledUnauthorized.current) return
    handledUnauthorized.current = true
    void clearLocalUserSession('expired')
  }, [cachedCookiePresent, session.error])

  useEffect(() => {
    if (!userId) {
      handledBanned.current = false
      if (session.error?.status !== 401) handledUnauthorized.current = false
      return
    }
    if (!isBanned(me.error) || handledBanned.current) return
    handledBanned.current = true
    void clearLocalUserSession('banned')
  }, [me.error, session.error, userId])

  if (!preferencesHydrated) return 'booting'
  if (!user) {
    const unresolvedSession = session.isPending || Boolean(session.error && session.error.status !== 401)
    if (unresolvedSession && cachedCookiePresent === null) return 'booting'
    if (unresolvedSession && cachedCookiePresent) {
      const cached = lastKnownUser
      return cached?.onboarded === false ? 'needsOnboarding' : 'ready'
    }
    return 'signedOut'
  }

  if (me.data) {
    if (me.data.onboarded !== undefined) return me.data.onboarded ? 'ready' : 'needsOnboarding'
    if (lastKnownUser && lastKnownUser.userId === userId && !lastKnownUser.onboarded) return 'needsOnboarding'
    return 'ready'
  }
  if (lastKnownUser && lastKnownUser.userId === userId && !lastKnownUser.onboarded) return 'needsOnboarding'
  return 'ready'
}
