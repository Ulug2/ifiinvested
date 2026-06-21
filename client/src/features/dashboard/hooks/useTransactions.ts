import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TransactionPage } from '@/types'

export function useTransactions(limit = 20) {
  return useInfiniteQuery<TransactionPage>({
    queryKey: ['transactions', limit],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | undefined
      const params = new URLSearchParams({ limit: String(limit) })
      if (cursor) params.set('cursor', cursor)
      return api.get<TransactionPage>(`/transactions?${params}`).then((r) => r.data)
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined,
    staleTime: 30_000,
  })
}
