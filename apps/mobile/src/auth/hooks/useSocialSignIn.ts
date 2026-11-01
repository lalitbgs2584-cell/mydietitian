import { useState } from 'react'
import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Linking from 'expo-linking'
import { authClient } from '@/auth/client'
import { env } from '@/lib/env'
import { usePrefsStore } from '@/store/prefs.store'
import { failureHaptic, mapAuthError, rememberAuthenticatedUser, successHaptic } from '@/auth/hooks/shared'

export type SocialProvider = 'google' | 'apple'

export function useSocialSignIn() {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null)

  const finish = async (provider: SocialProvider, userId?: string) => {
    usePrefsStore.getState().setLastAuthMethod(provider)
    if (userId) {
      await rememberAuthenticatedUser(userId, provider, false)
      await successHaptic()
      return true
    }
    const session = await authClient.getSession().catch(() => null)
    const currentId = session?.data?.user?.id
    if (currentId) {
      await rememberAuthenticatedUser(currentId, provider, false)
      await successHaptic()
      return true
    }
    return false
  }

  const signInGoogle = async () => {
    setLoadingProvider('google')
    try {
      const callbackURL = Linking.createURL('/') || 'mydietitian://'
      const result = await authClient.signIn.social({ provider: 'google', callbackURL })
      if (result.error) {
        const mapped = mapAuthError(result.error)
        if (mapped.kind !== 'cancelled') await failureHaptic()
        return mapped
      }
      const signedIn = await finish('google', result.data && 'user' in result.data ? (result.data as { user: { id: string } }).user.id : undefined)
      if (!signedIn) {
        // User closed the browser without completing authentication
        return { kind: 'cancelled' as const, message: '' }
      }
      return null
    } catch (error) {
      const mapped = mapAuthError(error)
      if (mapped.kind !== 'cancelled') await failureHaptic()
      return mapped
    } finally {
      setLoadingProvider(null)
    }
  }

  const signInApple = async () => {
    if (Platform.OS !== 'ios' || !env.APPLE_AUTH_ENABLED) return null
    setLoadingProvider('apple')
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      })
      if (!credential.identityToken) {
        await failureHaptic()
        return { kind: 'form' as const, message: 'Apple could not complete sign-in. Please try again.' }
      }
      const callbackURL = Linking.createURL('/') || 'mydietitian://'
      const result = await authClient.signIn.social({ provider: 'apple', idToken: { token: credential.identityToken }, callbackURL })
      if (result.error) {
        const mapped = mapAuthError(result.error)
        if (mapped.kind !== 'cancelled') await failureHaptic()
        return mapped
      }
      const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ').trim()
      if (name) await authClient.updateUser({ name })
      await finish('apple', result.data && 'user' in result.data ? (result.data as { user: { id: string } }).user.id : undefined)
      return null
    } catch (error) {
      const mapped = mapAuthError(error)
      if (mapped.kind !== 'cancelled') await failureHaptic()
      return mapped
    } finally {
      setLoadingProvider(null)
    }
  }

  return { loadingProvider, signInGoogle, signInApple, appleEnabled: env.APPLE_AUTH_ENABLED && Platform.OS === 'ios' }
}
