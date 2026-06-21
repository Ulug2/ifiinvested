import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PortfolioSummary } from '@/types'

export function usePortfolio() {
  return useQuery<PortfolioSummary>({
    queryKey: ['portfolio'],
    queryFn: () => api.get<PortfolioSummary>('/investments/portfolio').then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
