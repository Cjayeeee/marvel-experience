import type { Character } from '@/types/character'

/** "Spider-Man · Miles Morales": names repeat across variants, so add the real name. */
export function characterLabel(c: Pick<Character, 'name' | 'alias'>): string {
  return c.alias ? `${c.name} · ${c.alias}` : c.name
}
