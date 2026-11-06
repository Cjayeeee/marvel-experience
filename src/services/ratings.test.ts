import { describe, expect, it } from 'vitest'
import { characters } from '@/data/curated/characters'
import { ratings } from '@/data/curated/ratings'
import { POWER_ATTRIBUTES } from '@/types/character'
import { averageRatings, compareRatings, ratingTotal } from './ratings.service'

describe('editorial ratings', () => {
  it('rate every character, and only real characters', () => {
    const slugs = new Set(characters.map((c) => c.slug))
    expect(Object.keys(ratings).sort()).toEqual([...slugs].sort())
  })

  it('keep every value a whole number from 1 to 7', () => {
    for (const [slug, r] of Object.entries(ratings)) {
      for (const a of POWER_ATTRIBUTES) {
        expect(Number.isInteger(r[a]) && r[a] >= 1 && r[a] <= 7, `${slug}.${a} = ${r[a]}`).toBe(true)
      }
    }
  })

  it('compare, total and average', () => {
    const thor = ratings.thor!
    const cap = ratings['captain-america']!
    expect(ratingTotal(thor)).toBe(32)
    expect(compareRatings(thor, cap)).toMatchObject({ strength: 'a', fighting: 'b' })
    expect(averageRatings(['thor', 'captain-america', 'batman'])?.strength).toBe(5)
    expect(averageRatings([])).toBeNull()
  })
})
