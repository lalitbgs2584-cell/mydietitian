import { useQuery } from '@tanstack/react-query'
import { apiData } from '@/lib/api'

export interface MeResponse {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  onboarded?: boolean
}

export function useMe(userId: string | undefined) {
  return useQuery({
    queryKey: ['auth', 'me', userId],
    enabled: Boolean(userId),
    queryFn: () => apiData<MeResponse>('/api/v1/auth/me', undefined, { authenticated: true }),
  })
}
