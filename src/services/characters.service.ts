import { characters } from '@/data/curated/characters'
import { teams } from '@/data/curated/teams'
import { universeById, universes } from '@/data/curated/universes'
import type { Character, CharacterPage, CharacterQuery, Team, Universe } from '@/types/character'

/**
 * Character data access. Every call is async so the UI is already written
 * against the shape a network source needs; a future database swaps the bodies for
 * real queries without touching any component.
 */

export const CHARACTER_PAGE_SIZE = 12

/** Lowercase, strip accents and punctuation, collapse spaces. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type Indexed = { character: Character; name: string; alias: string; rest: string }

const index: Indexed[] = characters.map((character) => ({
  character,
  name: normalize(character.name),
  alias: normalize(character.alias ?? ''),
  rest: normalize(
    [
      universeById(character.universe)?.designation ?? '',
      ...character.teams.map((slug) => teams.find((t) => t.slug === slug)?.name ?? ''),
      ...character.powers,
    ].join(' '),
  ),
}))

/** Higher is better; 0 means no match. */
function score(entry: Indexed, terms: string[]): number {
  let total = 0
  for (const term of terms) {
    if (entry.name.startsWith(term)) total += 6
    else if (entry.name.includes(term)) total += 4
    else if (entry.alias.includes(term)) total += 3
    else if (entry.rest.includes(term)) total += 1
    else return 0 // every term must match somewhere
  }
  return total
}

function matchesFilters(c: Character, query: CharacterQuery): boolean {
  const { filter = 'all', team, universe } = query
  if (filter === 'hero' || filter === 'villain' || filter === 'antihero') {
    if (c.category !== filter) return false
  } else if (filter === 'cosmic' || filter === 'variant') {
    if (!c.tags.includes(filter)) return false
  }
  if (team && !c.teams.includes(team)) return false
  if (universe && c.universe !== universe) return false
  return true
}

function sortCharacters(list: Character[], sort: CharacterQuery['sort']): Character[] {
  const byName = (a: Character, b: Character) => a.name.localeCompare(b.name) || (a.alias ?? '').localeCompare(b.alias ?? '')
  const sorted = [...list]
  switch (sort) {
    case 'name-desc':
      return sorted.sort((a, b) => byName(b, a))
    case 'debut-asc':
      return sorted.sort((a, b) => a.firstAppearance.year - b.firstAppearance.year || byName(a, b))
    case 'debut-desc':
      return sorted.sort((a, b) => b.firstAppearance.year - a.firstAppearance.year || byName(a, b))
    default:
      return sorted.sort(byName)
  }
}

export async function listCharacters(query: CharacterQuery, page = 0, pageSize = CHARACTER_PAGE_SIZE): Promise<CharacterPage> {
  const terms = normalize(query.q ?? '').split(' ').filter(Boolean)
  let results: Character[]

  if (terms.length) {
    // With a search term, relevance wins unless the user picked a sort.
    const scored = index
      .filter((entry) => matchesFilters(entry.character, query))
      .map((entry) => ({ c: entry.character, s: score(entry, terms) }))
      .filter((x) => x.s > 0)
    results = query.sort
      ? sortCharacters(scored.map((x) => x.c), query.sort)
      : scored.sort((a, b) => b.s - a.s || a.c.name.localeCompare(b.c.name)).map((x) => x.c)
  } else {
    results = sortCharacters(characters.filter((c) => matchesFilters(c, query)), query.sort)
  }

  const start = page * pageSize
  const items = results.slice(start, start + pageSize)
  return {
    items,
    total: results.length,
    nextPage: start + pageSize < results.length ? page + 1 : null,
  }
}

export async function getCharacter(slug: string): Promise<Character | null> {
  return characters.find((c) => c.slug === slug) ?? null
}

/** Every character, A–Z, for pickers (arena, team builder). */
export async function getAllCharacters(): Promise<Character[]> {
  return [...characters].sort((a, b) => a.name.localeCompare(b.name) || (a.alias ?? '').localeCompare(b.alias ?? ''))
}

/** Characters for a list of slugs, in the same order; unknown slugs are skipped. */
export async function getCharactersBySlugs(slugs: string[]): Promise<Character[]> {
  return slugs.flatMap((slug) => characters.find((c) => c.slug === slug) ?? [])
}

export async function getRelatedCharacters(character: Character): Promise<Character[]> {
  return character.related.flatMap((slug) => characters.find((c) => c.slug === slug) ?? [])
}

/** Other characters who share a team with this one, for "Also on the roster". */
export async function getTeammates(character: Character, limit = 6): Promise<Character[]> {
  if (!character.teams.length) return []
  return characters
    .filter((c) => c.slug !== character.slug && !character.related.includes(c.slug) && c.teams.some((t) => character.teams.includes(t)))
    .slice(0, limit)
}

export type CharacterFacets = {
  teams: (Team & { count: number })[]
  universes: (Universe & { count: number })[]
  total: number
}

export async function getCharacterFacets(): Promise<CharacterFacets> {
  return {
    teams: teams.map((t) => ({ ...t, count: characters.filter((c) => c.teams.includes(t.slug)).length })),
    universes: universes
      .map((u) => ({ ...u, count: characters.filter((c) => c.universe === u.id).length }))
      .filter((u) => u.count > 0),
    total: characters.length,
  }
}

/** File number shown on cards and dossiers, stable per character. */
export function fileNumber(slug: string): string {
  const position = characters.findIndex((c) => c.slug === slug)
  return String(position + 1).padStart(4, '0')
}

/** Neighbouring files in archive order, for previous / next navigation. */
export async function getAdjacentCharacters(slug: string): Promise<{ previous: Character | null; next: Character | null }> {
  const i = characters.findIndex((c) => c.slug === slug)
  if (i === -1) return { previous: null, next: null }
  return {
    previous: characters[(i - 1 + characters.length) % characters.length] ?? null,
    next: characters[(i + 1) % characters.length] ?? null,
  }
}
