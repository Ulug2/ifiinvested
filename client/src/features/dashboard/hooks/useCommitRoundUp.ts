import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/features/auth/auth.store'

export function useCommitRoundUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/roundups/commit').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roundup-summary'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      qc.invalidateQueries({ queryKey: ['projection'] })
      // Refresh XP/level in auth store
      useAuthStore.getState().initialize()
    },
  })
}
