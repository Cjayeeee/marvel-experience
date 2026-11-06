/** Domain types for the character archive. Shaped so they can map onto database tables later. */

export type CharacterCategory = 'hero' | 'villain' | 'antihero'

/** Cross-cutting labels used by the "cosmic" and "variant" filters. */
export type CharacterTag = 'cosmic' | 'variant'

export type FirstAppearance = {
  /** Comic issue or screen title, e.g. "Amazing Fantasy #15". */
  title: string
  year: number
  medium: 'comic' | 'screen'
}

export type ScreenAppearance = {
  title: string
  year: number
  kind: 'film' | 'series'
  /** Performer (or voice) for that appearance, when well established. */
  actor?: string
}

export type Character = {
  slug: string
  name: string
  /** Civilian / real name. Null when the character is only known by one name. */
  alias: string | null
  category: CharacterCategory
  tags: CharacterTag[]
  /** Universe id, e.g. "earth-616". */
  universe: string
  /** Team slugs. */
  teams: string[]
  powers: string[]
  bio: string
  origin: string
  firstAppearance: FirstAppearance
  /** A few notable screen appearances, not an exhaustive filmography. */
  screen: ScreenAppearance[]
  /** Slugs of closely connected characters (allies, rivals, variants). */
  related: string[]
}

/** Where a reality is mainly told: in print, on screen, or both. */
export type UniverseMedium = 'comics' | 'screen' | 'both'

export type NotableTitle = {
  title: string
  year: number
  kind: 'comic' | 'film' | 'series'
}

export type Universe = {
  id: string
  designation: string
  name: string
  description: string
  medium: UniverseMedium
  /** A few key stories set in this reality. */
  notable: NotableTitle[]
}

/** A documented story in which characters crossed between two realities. */
export type Crossing = {
  id: string
  from: string
  to: string
  event: string
  year: number
  kind: 'comic' | 'film' | 'series'
  summary: string
}

/** The six rated attributes, in display order. */
export const POWER_ATTRIBUTES = ['intelligence', 'strength', 'speed', 'durability', 'energy', 'fighting'] as const

export type PowerAttribute = (typeof POWER_ATTRIBUTES)[number]

/** Editorial 1–7 estimates (src/data/curated/ratings.ts), not official figures. */
export type PowerRatings = Record<PowerAttribute, number>

export type Team = {
  slug: string
  name: string
  line: string
}

export type CharacterFilter = 'all' | CharacterCategory | CharacterTag

export type CharacterSort = 'name-asc' | 'name-desc' | 'debut-asc' | 'debut-desc'

export type CharacterQuery = {
  q?: string
  filter?: CharacterFilter
  team?: string
  universe?: string
  sort?: CharacterSort
}

export type CharacterPage = {
  items: Character[]
  total: number
  nextPage: number | null
}
