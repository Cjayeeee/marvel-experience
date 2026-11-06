import { characters } from '@/data/curated/characters'
import { titles } from '@/data/curated/titles'
import type { Character } from '@/types/character'
import type { Title, TitleKind } from '@/types/title'

/** Catalogue access (curated list; OMDb supplies the details). */

export type TitleSort = 'release-asc' | 'release-desc' | 'title' | 'chrono'

export type TitleQuery = {
  kind?: TitleKind
  q?: string
  /** "1"–"6", or "netflix" for Marvel Television's Netflix series. */
  phase?: string
  sort?: TitleSort
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Released on or before today (scheduled titles excluded). */
export function isReleased(title: Title, today = new Date()): boolean {
  return !title.scheduled && new Date(title.releaseDate) <= today
}

export async function listTitles(query: TitleQuery = {}): Promise<Title[]> {
  const terms = norm(query.q ?? '').split(' ').filter(Boolean)
  const list = titles.filter((t) => {
    if (query.kind && t.kind !== query.kind) return false
    if (query.phase === 'netflix' && t.phase !== null) return false
    if (query.phase && query.phase !== 'netflix' && String(t.phase) !== query.phase) return false
    if (terms.length && !terms.every((term) => norm(t.title).includes(term))) return false
    return true
  })
  const byRelease = (a: Title, b: Title) => a.releaseDate.localeCompare(b.releaseDate)
  switch (query.sort) {
    case 'release-desc':
      return list.sort((a, b) => byRelease(b, a))
    case 'title':
      return list.sort((a, b) => a.title.replace(/^The /, '').localeCompare(b.title.replace(/^The /, '')))
    case 'chrono':
      return list.sort((a, b) => (a.chronoIndex ?? 999) - (b.chronoIndex ?? 999) || byRelease(a, b))
    default:
      return list.sort(byRelease)
  }
}

export async function getTitle(id: string): Promise<Title | null> {
  return titles.find((t) => t.id === id) ?? null
}

export type TimelineOrder = 'release' | 'chronological'

/** Every title in release order, or the placed titles in story order. */
export async function getTimeline(order: TimelineOrder): Promise<Title[]> {
  if (order === 'chronological') {
    return titles.filter((t) => t.chronoIndex !== null).sort((a, b) => (a.chronoIndex ?? 0) - (b.chronoIndex ?? 0))
  }
  return [...titles].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
}

/** Most recent released titles, newest first. */
export async function getLatestTitles(count = 4, today = new Date()): Promise<Title[]> {
  return titles
    .filter((t) => isReleased(t, today))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, count)
}

/** Neighbours in release order, for previous / next navigation. */
export async function getAdjacentTitles(id: string): Promise<{ previous: Title | null; next: Title | null }> {
  const ordered = [...titles].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
  const i = ordered.findIndex((t) => t.id === id)
  return { previous: ordered[i - 1] ?? null, next: ordered[i + 1] ?? null }
}

/** Characters in the archive who are listed as appearing in this title. */
export async function getCharactersInTitle(title: Title): Promise<{ character: Character; actor?: string }[]> {
  const key = norm(title.title)
  return characters.flatMap((c) => {
    const hit = c.screen.find((s) => norm(s.title) === key)
    return hit ? [{ character: c, actor: hit.actor }] : []
  })
}

/** Map a screen-appearance title (from a dossier) to a catalogue id, if it's in the catalogue. */
export function findTitleId(name: string): string | null {
  const key = norm(name)
  return titles.find((t) => norm(t.title) === key)?.id ?? null
}

export function phaseLabel(phase: number | null): string {
  return phase === null ? 'Marvel Television' : `Phase ${phase}`
}
