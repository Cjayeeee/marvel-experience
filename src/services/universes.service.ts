import { characters } from '@/data/curated/characters'
import { crossings } from '@/data/curated/crossings'
import { universeById, universes } from '@/data/curated/universes'
import type { Character, Crossing, Universe } from '@/types/character'

/**
 * Universe data access (async, Supabase-ready — see characters.service).
 */

export type UniverseSummary = Universe & { characterCount: number; crossingCount: number }

export type UniverseCrossing = Crossing & { other: Universe }

export type UniverseDetail = {
  universe: Universe
  characters: Character[]
  crossings: UniverseCrossing[]
}

export async function listUniverses(): Promise<UniverseSummary[]> {
  return universes.map((u) => ({
    ...u,
    characterCount: characters.filter((c) => c.universe === u.id).length,
    crossingCount: crossings.filter((x) => x.from === u.id || x.to === u.id).length,
  }))
}

export async function listCrossings(): Promise<Crossing[]> {
  return crossings
}

export async function getUniverseDetail(id: string): Promise<UniverseDetail | null> {
  const universe = universeById(id)
  if (!universe) return null
  return {
    universe,
    characters: characters.filter((c) => c.universe === id),
    crossings: crossings
      .filter((x) => x.from === id || x.to === id)
      .flatMap((x) => {
        const other = universeById(x.from === id ? x.to : x.from)
        return other ? [{ ...x, other }] : []
      })
      .sort((a, b) => a.year - b.year),
  }
}
