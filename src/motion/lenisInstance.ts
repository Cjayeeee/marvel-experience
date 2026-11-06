import type Lenis from 'lenis'

/** Holder for the running Lenis instance. Kept dependency-free to avoid import cycles. */
let current: Lenis | null = null

export function getLenis(): Lenis | null {
  return current
}

export function setLenis(instance: Lenis | null): void {
  current = instance
}
