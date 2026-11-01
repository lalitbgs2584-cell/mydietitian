import { useState } from 'react'
import { authClient } from '@/auth/client'
import { failureHaptic, mapAuthError, rememberAuthenticatedUser, successHaptic } from '@/auth/hooks/shared'

export function useSignIn() {
  const [loading, setLoading] = useState(false)
  const submit = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await authClient.signIn.email(values)
      if (result.error) {
        await failureHaptic()
        return mapAuthError(result.error)
      }
      const userId = result.data?.user?.id
      if (userId) await rememberAuthenticatedUser(userId, 'email', true)
      await successHaptic()
      return null
    } catch (error) {
      await failureHaptic()
      return mapAuthError(error)
    } finally {
      setLoading(false)
    }
  }
  return { loading, submit }
}
