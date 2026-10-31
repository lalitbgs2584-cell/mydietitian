import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, withTimeout } from '@/lib/api'

export type BootstrapRoute = '/(tabs)' | '/(auth)/login' | '/(onboarding)'

export interface BootstrapState {
  ready: boolean
  route: BootstrapRoute
}

export function useBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({
    ready: false,
    route: '/(onboarding)',
  })

  useEffect(() => {
    let mounted = true

    async function runBootstrap() {
      // (a) Better Auth session check
      // Note: No authClient exists in src/lib; defaults to null session until added.
      const checkSession = async (): Promise<boolean> => {
        return false
      }

      // (b) AsyncStorage onboarded flag
      const checkOnboarded = async (): Promise<boolean> => {
        const val = await AsyncStorage.getItem('onboarded')
        return val === 'true'
      }

      // (c) GET /health
      const checkHealth = async (): Promise<unknown> => {
        return api('/health')
      }

      const [hasSession, isOnboarded] = await Promise.all([
        withTimeout(checkSession(), 4000, false),
        withTimeout(checkOnboarded(), 4000, false),
        withTimeout(checkHealth(), 4000, null),
      ])

      const route: BootstrapRoute = hasSession
        ? '/(tabs)'
        : isOnboarded
          ? '/(auth)/login'
          : '/(onboarding)'

      if (mounted) {
        setState({ ready: true, route })
      }
    }

    runBootstrap()

    return () => {
      mounted = false
    }
  }, [])

  return state
}

