import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/motion/gsap'
import { Link } from 'react-router'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { villains } from '@/data/curated/home'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { cn } from '@/lib/cn'

/** Rotating "lens" portrait + selectable roster (Orbita's vinyl frame). */
export function VillainsSection() {
  const [activeSlug, setActiveSlug] = useState(villains[0]?.slug ?? '')
  const active = villains.find((v) => v.slug === activeSlug) ?? villains[0]
  const root = useRef<HTMLElement>(null)

  // The lens turns and comes forward as the section scrolls through.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const scrollTrigger = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        gsap.fromTo('[data-lens]', { scale: 0.82 }, { scale: 1, ease: 'none', scrollTrigger })
        gsap.fromTo('[data-lens-ring]', { rotate: -35 }, { rotate: 20, ease: 'none', scrollTrigger: { ...scrollTrigger } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="villains-heading" className="overflow-hidden bg-void py-24 text-bone sm:py-32">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Lens */}
        <div data-lens className="relative mx-auto aspect-square w-full max-w-[34rem]">
          <div data-lens-ring className="absolute inset-0">
          <svg viewBox="0 0 200 200" aria-hidden="true" className="orbit-spin absolute inset-0 size-full text-red">
            <defs>
              <path id="lens-ring" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
            </defs>
            <text fontSize="8.6" letterSpacing="2.4" fill="currentColor" className="font-mono">
              <textPath href="#lens-ring">
                THREAT DETECTED · THREAT DETECTED · THREAT DETECTED · THREAT DETECTED ·
              </textPath>
            </text>
          </svg>
          </div>
          <div className="orbit-spin-reverse absolute inset-[9%] rounded-full border border-dashed border-line" />
          <div className="absolute inset-[14%] overflow-hidden rounded-full border-[6px] border-void-card">
            {active ? (
              <CharacterArt
                key={active.slug}
                character={active}
                tone="red"
                className="size-full animate-[card-in_0.6s_var(--ease-cinematic)_both]"
              />
            ) : null}
          </div>
        </div>

        {/* Roster */}
        <div className="flex flex-col gap-10">
          <SectionHeading id="villains-heading" lead="Villains" accent="Of every reality" />
          <ul data-reveal="stagger" className="flex flex-col border-t border-line" aria-label="Villains">
            {villains.map((villain, index) => {
              const isActive = villain.slug === activeSlug
              return (
                <li key={villain.slug} className="flex items-center border-b border-line">
                  <button
                    type="button"
                    onClick={() => setActiveSlug(villain.slug)}
                    onMouseEnter={() => setActiveSlug(villain.slug)}
                    aria-pressed={isActive}
                    className="flex flex-1 items-baseline gap-4 py-4 text-left"
                  >
                    <span className="w-7 font-mono text-[0.72rem] text-mute">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'font-display text-[clamp(1.75rem,3.4vw,2.75rem)] uppercase leading-none transition-colors',
                        isActive ? 'text-red-bright' : 'text-bone/80',
                      )}
                    >
                      {villain.name}
                    </span>
                    <span className="ml-auto hidden font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mute sm:block">
                      {villain.epithet}
                    </span>
                  </button>
                  <Link
                    to={`/characters/${villain.slug}`}
                    aria-label={`Open file: ${villain.name}`}
                    className="ml-4 flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:border-red hover:bg-red"
                  >
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Eyebrow className="text-mute">Threat levels are editorial and arrive with the character files.</Eyebrow>
        </div>
      </Container>
    </section>
  )
}
