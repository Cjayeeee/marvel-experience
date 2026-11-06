import { ratings } from '@/data/curated/ratings'
import { POWER_ATTRIBUTES, type PowerAttribute, type PowerRatings } from '@/types/character'

/** Editorial power ratings (1–7). See src/data/curated/ratings.ts for what they are and aren't. */

export const RATING_MAX = 7

export const attributeLabels: Record<PowerAttribute, { label: string; short: string; hint: string }> = {
  intelligence: { label: 'Intelligence', short: 'INT', hint: 'Knowledge, invention, strategy' },
  strength: { label: 'Strength', short: 'STR', hint: 'Raw physical power' },
  speed: { label: 'Speed', short: 'SPD', hint: 'Movement, flight, teleportation' },
  durability: { label: 'Durability', short: 'DUR', hint: 'How much punishment they can take' },
  energy: { label: 'Energy', short: 'NRG', hint: 'Blasts, magic and other projected power' },
  fighting: { label: 'Fighting', short: 'FGT', hint: 'Combat training and skill' },
}

export const RATINGS_NOTE = 'Editorial estimates on a 1–7 scale, in the style of the Official Handbook power grid. Not official figures.'

export function getRatings(slug: string): PowerRatings | null {
  return ratings[slug] ?? null
}

export function ratingTotal(r: PowerRatings): number {
  return POWER_ATTRIBUTES.reduce((sum, a) => sum + r[a], 0)
}

/** Average of each attribute across a team (members without ratings are skipped). */
export function averageRatings(slugs: string[]): PowerRatings | null {
  const rated = slugs.flatMap((s) => ratings[s] ?? [])
  if (!rated.length) return null
  return Object.fromEntries(
    POWER_ATTRIBUTES.map((a) => [a, rated.reduce((sum, r) => sum + r[a], 0) / rated.length]),
  ) as PowerRatings
}

/** Per-attribute edge between two characters: "a", "b" or "even". */
export function compareRatings(a: PowerRatings, b: PowerRatings): Record<PowerAttribute, 'a' | 'b' | 'even'> {
  return Object.fromEntries(POWER_ATTRIBUTES.map((k) => [k, a[k] > b[k] ? 'a' : a[k] < b[k] ? 'b' : 'even'])) as Record<
    PowerAttribute,
    'a' | 'b' | 'even'
  >
}
