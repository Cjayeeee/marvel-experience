import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useSyncExternalStore } from 'react'

/** The first error from any OMDb query in the cache, updating live. */
export function useOmdbError(): unknown {
  const cache = useQueryClient().getQueryCache()
  const subscribe = useCallback((notify: () => void) => cache.subscribe(notify), [cache])
  const snapshot = useCallback(
    () => cache.findAll({ queryKey: ['omdb'] }).find((q) => q.state.error)?.state.error ?? null,
    [cache],
  )
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
