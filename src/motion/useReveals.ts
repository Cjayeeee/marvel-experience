import type { RefObject } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'

/**
 * Declarative scroll reveals inside `scope`:
 *  - data-reveal="heading"  → lines rise out of a mask
 *  - data-reveal="up"       → element fades up
 *  - data-reveal="stagger"  → direct children fade up one after another
 *
 * Content is fully visible without JS and for reduced-motion users;
 * the hidden "from" state is applied only when motion is allowed.
 */
export function useReveals(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = scope.current
        if (!root) return

        root.querySelectorAll<HTMLElement>('[data-reveal="heading"]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1.1,
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
              }),
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal="up"]').forEach((el) => {
          gsap.from(el, {
            y: 48,
            autoAlpha: 0,
            duration: 1,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((group) => {
          const items = Array.from(group.children)
          gsap.set(items, { y: 56, autoAlpha: 0 })
          ScrollTrigger.batch(items, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }),
          })
        })
      })
      return () => mm.revert()
    },
    { scope },
  )
}
