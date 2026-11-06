import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { gsap } from './gsap'
import { prefersReducedMotion } from './tokens'

/**
 * Signature page transition: on every new page the screen starts shut, a red
 * slit opens across the middle, and the two halves part like doors:
 * the same gesture that ends the intro.
 */
export function RouteTransition() {
  const { pathname } = useLocation()
  const root = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = root.current
    if (!el || prefersReducedMotion()) return

    const q = gsap.utils.selector(el)
    const tl = gsap.timeline()
    tl.set(el, { autoAlpha: 1 })
      .set(q('[data-door="top"]'), { yPercent: 0 })
      .set(q('[data-door="bottom"]'), { yPercent: 0 })
      .fromTo(q('[data-slit]'), { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.35, ease: 'expo.out' })
      .to(q('[data-door="top"]'), { yPercent: -101, duration: 0.75, ease: 'power3.inOut' }, '-=0.05')
      .to(q('[data-door="bottom"]'), { yPercent: 101, duration: 0.75, ease: 'power3.inOut' }, '<')
      .to(q('[data-slit]'), { autoAlpha: 0, duration: 0.25 }, '<0.1')
      .set(el, { autoAlpha: 0 })

    return () => {
      tl.kill()
      gsap.set(el, { autoAlpha: 0 })
    }
  }, [pathname])

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[75]">
      <div data-door="top" className="absolute inset-x-0 top-0 h-1/2 bg-void" />
      <div data-door="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-void" />
      <div data-slit className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 origin-center bg-red" />
    </div>
  )
}
