import { getRatings } from '@/services/ratings.service'
import type { PowerAttribute } from '@/types/character'
import type { TeamRole } from '@/types/library'

export const roleInfo: Record<TeamRole, { label: string; hint: string; attribute: PowerAttribute | null }> = {
  powerhouse: { label: 'Powerhouse', hint: 'Takes the hits, hits back harder', attribute: 'strength' },
  tactician: { label: 'Tactician', hint: 'Plans the play', attribute: 'intelligence' },
  scout: { label: 'Scout', hint: 'First in, fastest out', attribute: 'speed' },
  blaster: { label: 'Blaster', hint: 'Damage from range', attribute: 'energy' },
  brawler: { label: 'Brawler', hint: 'Close-quarters specialist', attribute: 'fighting' },
  wildcard: { label: 'Wildcard', hint: 'Breaks the rules on purpose', attribute: null },
}

/**
 * A starting role from a character's strongest editorial rating. Strength and
 * durability both count toward Powerhouse. Speed counts one point less,
 * because teleporters rate 7 there but rarely play as scouts. Ties go to
 * the order below.
 */
export function suggestRole(slug: string): TeamRole {
  const r = getRatings(slug)
  if (!r) return 'wildcard'
  const scores: [TeamRole, number][] = [
    ['powerhouse', Math.max(r.strength, r.durability)],
    ['tactician', r.intelligence],
    ['blaster', r.energy],
    ['brawler', r.fighting],
    ['scout', r.speed - 1],
  ]
  return scores.reduce((best, s) => (s[1] > best[1] ? s : best))[0]
}
