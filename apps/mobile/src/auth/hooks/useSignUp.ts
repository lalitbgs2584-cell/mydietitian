import { useState } from 'react'
import { authClient } from '@/auth/client'
import { failureHaptic, mapAuthError, rememberAuthenticatedUser, successHaptic } from '@/auth/hooks/shared'

export function useSignUp() {
  const [loading, setLoading] = useState(false)
  const submit = async (values: { name: string; email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await authClient.signUp.email(values)
      if (result.error) {
        await failureHaptic()
        return { error: mapAuthError(result.error), needsVerification: false }
      }
      const userId = result.data?.user?.id
      const hasSession = Boolean(result.data?.token && userId)
      if (hasSession && userId) {
        await rememberAuthenticatedUser(userId, 'email', false)
        await successHaptic()
        return { error: null, needsVerification: false }
      }
      return { error: null, needsVerification: true }
    } catch (error) {
      await failureHaptic()
      return { error: mapAuthError(error), needsVerification: false }
    } finally {
      setLoading(false)
    }
  }
  return { loading, submit }
}
