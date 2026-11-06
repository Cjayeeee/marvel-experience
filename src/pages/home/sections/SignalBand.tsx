import { useRef } from 'react'
import { Marquee } from '@/components/ui/Marquee'
import { gsap, useGSAP } from '@/motion/gsap'

const signals = [
  'Variant detected',
  'Nexus event in progress',
  'Earth-616 stable',
  'Incursion risk: low',
  'New file opened',
]

/** Crossing ticker bands between sections. */
export function SignalBand() {
  const root = useRef<HTMLElement>(null)

  // On top of the ticker loop, scroll pushes the two bands apart.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const [red, paper] = gsap.utils.toArray<HTMLElement>('[data-band]', root.current)
        const trigger = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 }
        if (red) gsap.fromTo(red, { xPercent: 4 }, { xPercent: -4, ease: 'none', scrollTrigger: trigger })
        if (paper) gsap.fromTo(paper, { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: { ...trigger } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Archive signals" className="relative overflow-hidden bg-void py-10 sm:py-16">
      <div data-band>
        <Marquee items={signals} className="-mx-4 -rotate-2 bg-red py-4 text-white" />
      </div>
      <div data-band>
      <Marquee
        items={['Every universe', 'Every hero', 'Every possibility']}
        className="-mx-4 mt-[-0.75rem] rotate-[1.5deg] bg-paper py-3 text-ink [&_.marquee-track]:[animation-direction:reverse]"
      />
      </div>
    </section>
  )
}
