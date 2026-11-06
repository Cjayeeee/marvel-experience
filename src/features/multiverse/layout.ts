import type { UniverseMedium } from '@/types/character'

/**
 * Presentation-only placement of each universe, shared by the 3D map
 * (x, y, z in world units) and the 2D blueprint (x, y as % of the box).
 * Earth-616 sits at the centre; screen realities cluster on one side,
 * comic realities on the other, mixed ones in between.
 */
export const universeLayout: Record<string, { x: number; y: number; z: number; map: { x: number; y: number } }> = {
  'earth-616': { x: 0, y: 0, z: 0, map: { x: 50, y: 50 } },
  'earth-199999': { x: -6.5, y: 1.2, z: -1.5, map: { x: 22, y: 42 } },
  'earth-1610': { x: 4.8, y: 2.6, z: 2.2, map: { x: 70, y: 26 } },
  'earth-838': { x: -9.5, y: -2.4, z: 2.5, map: { x: 10, y: 76 } },
  'earth-65': { x: 7.2, y: -1.8, z: -2.4, map: { x: 82, y: 62 } },
  'earth-928': { x: 9.2, y: 3.4, z: -5.5, map: { x: 90, y: 22 } },
  'earth-807128': { x: 3.2, y: -4.4, z: 4.2, map: { x: 56, y: 86 } },
  'earth-10005': { x: -4.2, y: -4.6, z: -4.4, map: { x: 30, y: 84 } },
  'earth-96283': { x: -7.8, y: 4.4, z: 3.6, map: { x: 22, y: 12 } },
}

/** Node colour by medium (display-space RGB). Violet and cyan stay inside 3D/maps. */
export const mediumColor: Record<UniverseMedium, string> = {
  comics: '#e62429',
  screen: '#4fd1ff',
  both: '#8f7bff',
}

export const mediumLabel: Record<UniverseMedium, string> = {
  comics: 'Comics',
  screen: 'Screen',
  both: 'Comics & screen',
}

/** Node size grows gently with how many characters are on file there. */
export function nodeRadius(characterCount: number): number {
  return 0.55 + Math.sqrt(characterCount) * 0.12
}
