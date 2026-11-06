import { prefersReducedMotion } from '@/motion/tokens'

export type RenderTier = 'none' | 'low' | 'high'

let cached: RenderTier | null = null

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

/**
 * Decide how much 3D this device should get.
 *  none → static fallback (no WebGL, reduced motion, very weak hardware)
 *  low  → phones / modest hardware: fewer particles, dpr 1
 *  high → full scene
 */
export function getRenderTier(): RenderTier {
  if (cached) return cached
  if (typeof window === 'undefined' || prefersReducedMotion() || !hasWebGL2()) {
    cached = 'none'
    return cached
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  if (cores < 2 || memory < 2) {
    cached = 'none'
  } else if (window.matchMedia('(max-width: 768px), (pointer: coarse)').matches || cores < 4 || memory < 4) {
    cached = 'low'
  } else {
    cached = 'high'
  }
  return cached
}
