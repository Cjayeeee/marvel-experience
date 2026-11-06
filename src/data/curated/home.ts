/**
 * Curated homepage content. Characters come from the archive
 * (src/data/curated/characters.ts) and titles (src/data/curated/titles.ts).
 */
import { characterArtwork } from './artwork'
import { characters } from './characters'
import { teams } from './teams'
import type { Title } from '@/types/title'
import { titles } from './titles'
import { universeById } from './universes'

export type FeaturedCharacter = {
  slug: string
  name: string
  alias: string
  universe: string
}

const featuredSlugs = [
  'iron-man',
  'spider-man-miles-morales',
  'captain-carter',
  'ghost-spider',
  'black-panther',
  'scarlet-witch',
  'doctor-strange',
  'wolverine',
]

/** Picked from the character archive so names and universes stay in one place. */
export const featuredHeroes: FeaturedCharacter[] = featuredSlugs.flatMap((slug) => {
  const c = characters.find((x) => x.slug === slug)
  if (!c) return []
  return [{ slug, name: c.name, alias: c.alias ?? '', universe: universeById(c.universe)?.designation ?? '' }]
})

const featuredTitleIds = [
  'avengers-endgame',
  'spider-man-no-way-home',
  'loki',
  'doctor-strange-multiverse-of-madness',
  'what-if',
  'deadpool-and-wolverine',
]

/** Multiverse-heavy titles for the homepage, picked from the catalogue. */
export const featuredTitles: Title[] = featuredTitleIds.flatMap((id) => titles.find((t) => t.id === id) ?? [])

export type Phase = {
  number: number
  saga: 'The Infinity Saga' | 'The Multiverse Saga'
  opener: Title
  closer: Title
  films: number
  series: number
  /** Titles in the phase that are announced but not yet released. */
  scheduled: number
}

/** MCU phases, derived from the catalogue so counts and openers never drift from it. */
export const phases: Phase[] = [1, 2, 3, 4, 5, 6].flatMap((number) => {
  const inPhase = titles
    .filter((t) => t.phase === number)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))
  const opener = inPhase[0]
  const closer = inPhase[inPhase.length - 1]
  if (!opener || !closer) return []
  return [
    {
      number,
      saga: number <= 3 ? 'The Infinity Saga' : 'The Multiverse Saga',
      opener,
      closer,
      films: inPhase.filter((t) => t.kind === 'film').length,
      series: inPhase.filter((t) => t.kind === 'series').length,
      scheduled: inPhase.filter((t) => t.scheduled).length,
    },
  ]
})

export type Villain = {
  slug: string
  name: string
  epithet: string
}

export const villains: Villain[] = [
  { slug: 'doctor-doom', name: 'Doctor Doom', epithet: 'Monarch of Latveria' },
  { slug: 'thanos', name: 'Thanos', epithet: 'The Mad Titan' },
  { slug: 'loki', name: 'Loki', epithet: 'God of Mischief' },
  { slug: 'kang', name: 'Kang', epithet: 'The Conqueror' },
  { slug: 'magneto', name: 'Magneto', epithet: 'Master of Magnetism' },
  { slug: 'hela', name: 'Hela', epithet: 'Goddess of Death' },
]

export type TeamRoster = {
  count: number
  /** Up to five members to show as faces, those with artwork first. */
  faces: { slug: string; name: string }[]
}

/** Who from the archive is on each team, for the homepage team stickers. */
export const teamRosters: Record<string, TeamRoster> = Object.fromEntries(
  teams.map((team) => {
    const members = characters.filter((c) => c.teams.includes(team.slug))
    const faces = [...members]
      .sort((a, b) => Number(Boolean(characterArtwork[b.slug])) - Number(Boolean(characterArtwork[a.slug])))
      .slice(0, 5)
      .map((c) => ({ slug: c.slug, name: c.name }))
    return [team.slug, { count: members.length, faces }]
  }),
)
