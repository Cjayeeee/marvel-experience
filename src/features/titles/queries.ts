import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTitleDetails, OmdbError, OmdbKeyMissingError } from '@/services/omdb.service'
import {
  getAdjacentTitles,
  getCharactersInTitle,
  getLatestTitles,
  getTimeline,
  getTitle,
  getTitlesByIds,
  listTitles,
  type TimelineOrder,
  type TitleQuery,
} from '@/services/titles.service'
import type { Title } from '@/types/title'

export function useTitles(query: TitleQuery) {
  return useQuery({ queryKey: ['titles', 'list', query], queryFn: () => listTitles(query) })
}

export function useTitle(id: string) {
  return useQuery({ queryKey: ['titles', 'detail', id], queryFn: () => getTitle(id) })
}

/** Titles for saved ids, e.g. favourites, kept in the given order. */
export function useTitlesByIds(ids: string[]) {
  return useQuery({
    queryKey: ['titles', 'by-ids', ids],
    queryFn: () => getTitlesByIds(ids),
    placeholderData: keepPreviousData,
  })
}

export function useTimeline(order: TimelineOrder) {
  return useQuery({ queryKey: ['titles', 'timeline', order], queryFn: () => getTimeline(order) })
}

export function useLatestTitles(count = 4) {
  return useQuery({ queryKey: ['titles', 'latest', count], queryFn: () => getLatestTitles(count) })
}

export function useAdjacentTitles(id: string) {
  return useQuery({ queryKey: ['titles', 'adjacent', id], queryFn: () => getAdjacentTitles(id) })
}

export function useCharactersInTitle(title: Title | null | undefined) {
  return useQuery({
    queryKey: ['titles', 'characters', title?.id],
    queryFn: () => (title ? getCharactersInTitle(title) : Promise.resolve([])),
    enabled: Boolean(title),
  })
}

/**
 * OMDb details for a title. `enabled` lets cards fetch only once they scroll
 * into view. Key and quota problems are not retried.
 */
export function useTitleDetails(title: Title | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['omdb', title?.id],
    queryFn: () => getTitleDetails(title as Title),
    enabled: Boolean(title) && enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: (count, error) =>
      !(error instanceof OmdbKeyMissingError) &&
      !(error instanceof OmdbError && error.reason !== 'network') &&
      count < 2,
  })
}
