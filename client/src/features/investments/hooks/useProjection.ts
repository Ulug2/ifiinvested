import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProjectionPoint } from '@/types'

export function useProjection() {
  return useQuery<ProjectionPoint[]>({
    queryKey: ['projection'],
    queryFn: () => api.get<ProjectionPoint[]>('/investments/projection').then((r) => r.data),
    staleTime: 5 * 60_000, // projections don't change often
    refetchOnWindowFocus: false,
  })
}
