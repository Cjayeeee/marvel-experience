/**
 * Shared motion vocabulary. GSAP timelines (Milestone 2+) and CSS transitions
 * both read from here so every page moves with the same rhythm.
 */
export const duration = {
  fast: 0.2,
  base: 0.45,
  slow: 0.9,
} as const

export const ease = {
  /** Reveals, entrances. GSAP name / CSS equivalent. */
  cinematic: { gsap: 'expo.out', css: 'var(--ease-cinematic)' },
  /** Portal dives, slit wipes, route transitions. */
  portal: { gsap: 'power3.inOut', css: 'var(--ease-portal)' },
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
