import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { CharacterFilter, CharacterQuery, CharacterSort } from '@/types/character'

const FILTERS: CharacterFilter[] = ['all', 'hero', 'villain', 'antihero', 'cosmic', 'variant']
const SORTS: CharacterSort[] = ['name-asc', 'name-desc', 'debut-asc', 'debut-desc']

function pick<T extends string>(value: string | null, allowed: T[]): T | undefined {
  return value && (allowed as string[]).includes(value) ? (value as T) : undefined
}

/**
 * Explorer state lives in the URL (?q=&filter=&team=&universe=&sort=), so
 * every view can be bookmarked, shared and restored with the back button.
 * The search box updates the URL after a short pause (debounced).
 */
export function useCharacterParams() {
  const [params, setParams] = useSearchParams()

  const query: CharacterQuery = useMemo(
    () => ({
      q: params.get('q')?.trim() || undefined,
      filter: pick(params.get('filter'), FILTERS) ?? 'all',
      team: params.get('team') || undefined,
      universe: params.get('universe') || undefined,
      sort: pick(params.get('sort'), SORTS),
    }),
    [params],
  )

  const update = useCallback(
    (patch: Partial<Record<'q' | 'filter' | 'team' | 'universe' | 'sort', string | undefined>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (!value || (key === 'filter' && value === 'all')) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true }), [setParams])

  // Search input: local state for instant typing, synced to the URL after 250ms.
  const [searchText, setSearchText] = useState(query.q ?? '')
  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((query.q ?? '') !== searchText.trim()) update({ q: searchText.trim() || undefined })
    }, 250)
    return () => window.clearTimeout(id)
  }, [searchText, query.q, update])

  // Keep the box in sync when the URL changes from elsewhere (reset, back button).
  const [lastUrlQ, setLastUrlQ] = useState(query.q)
  if (lastUrlQ !== query.q) {
    setLastUrlQ(query.q)
    if ((query.q ?? '') !== searchText.trim()) setSearchText(query.q ?? '')
  }

  const activeCount =
    (query.filter !== 'all' ? 1 : 0) + (query.team ? 1 : 0) + (query.universe ? 1 : 0) + (query.q ? 1 : 0)

  return { query, update, reset, searchText, setSearchText, activeCount }
}

export const filterLabels: Record<CharacterFilter, string> = {
  all: 'All',
  hero: 'Heroes',
  villain: 'Villains',
  antihero: 'Antiheroes',
  cosmic: 'Cosmic',
  variant: 'Variants',
}

export const sortLabels: Record<CharacterSort, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'debut-asc': 'Oldest debut',
  'debut-desc': 'Newest debut',
}

export { FILTERS as characterFilters, SORTS as characterSorts }
