import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { RoundUpSummary } from '@/types'

export function useRoundUpSummary() {
  return useQuery<RoundUpSummary>({
    queryKey: ['roundup-summary'],
    queryFn: () => api.get<RoundUpSummary>('/roundups/summary').then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
