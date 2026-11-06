import { useQuery } from '@tanstack/react-query'
import { getUniverseDetail, listCrossings, listUniverses } from '@/services/universes.service'

export function useUniverses() {
  return useQuery({ queryKey: ['universes', 'list'], queryFn: listUniverses, staleTime: Infinity })
}

export function useCrossings() {
  return useQuery({ queryKey: ['universes', 'crossings'], queryFn: listCrossings, staleTime: Infinity })
}

export function useUniverseDetail(id: string | null) {
  return useQuery({
    queryKey: ['universes', 'detail', id],
    queryFn: () => getUniverseDetail(id ?? ''),
    enabled: Boolean(id),
  })
}
