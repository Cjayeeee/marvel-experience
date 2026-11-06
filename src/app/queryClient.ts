import { QueryClient } from '@tanstack/react-query'

/** One cache for all server data (curated data, OMDb, and a database later). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
