import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getAdjacentCharacters,
  getCharacter,
  getCharacterFacets,
  getRelatedCharacters,
  getTeammates,
  listCharacters,
} from '@/services/characters.service'
import type { Character, CharacterQuery } from '@/types/character'

export const characterKeys = {
  all: ['characters'] as const,
  list: (query: CharacterQuery) => ['characters', 'list', query] as const,
  detail: (slug: string) => ['characters', 'detail', slug] as const,
  related: (slug: string) => ['characters', 'related', slug] as const,
  adjacent: (slug: string) => ['characters', 'adjacent', slug] as const,
  facets: ['characters', 'facets'] as const,
}

export function useCharacterSearch(query: CharacterQuery) {
  return useInfiniteQuery({
    queryKey: characterKeys.list(query),
    queryFn: ({ pageParam }) => listCharacters(query, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    // Keep showing the previous results while a new filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useCharacter(slug: string) {
  return useQuery({ queryKey: characterKeys.detail(slug), queryFn: () => getCharacter(slug) })
}

export function useRelatedCharacters(character: Character | null | undefined) {
  return useQuery({
    queryKey: characterKeys.related(character?.slug ?? ''),
    queryFn: async () => {
      if (!character) return { related: [], teammates: [] }
      const [related, teammates] = await Promise.all([getRelatedCharacters(character), getTeammates(character)])
      return { related, teammates }
    },
    enabled: Boolean(character),
  })
}

export function useCharacterFacets() {
  return useQuery({ queryKey: characterKeys.facets, queryFn: getCharacterFacets, staleTime: Infinity })
}

export function useAdjacentCharacters(slug: string) {
  return useQuery({ queryKey: characterKeys.adjacent(slug), queryFn: () => getAdjacentCharacters(slug) })
}
