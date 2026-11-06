import { getLenis } from '@/motion/lenisInstance'
import { prefersReducedMotion } from '@/motion/tokens'

/**
 * The intro plays on every full page load of the homepage (first visit and
 * reloads), never when navigating back to it inside the app, and never for
 * reduced-motion users. `?intro=1` forces it on any page.
 */
export function shouldPlayIntro(pathname: string, search: string): boolean {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (new URLSearchParams(search).get('intro') === '1') return true
  return pathname === '/'
}

/**
 * The intro always starts the page from the top. Stop the browser restoring
 * the old scroll position on reload, which would open the doors mid-page.
 */
export function resetScrollForIntro(): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  getLenis()?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}
