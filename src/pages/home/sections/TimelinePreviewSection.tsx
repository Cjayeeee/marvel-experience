import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/motion/gsap'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { phases } from '@/data/curated/home'

/** Film strip of MCU phases (Orbita's team film strip). Swipe on touch; scroll-driven on desktop. */
export function TimelinePreviewSection() {
  const root = useRef<HTMLElement>(null)

  // Desktop: the section pins and vertical scroll drives the strip sideways.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const strip = root.current?.querySelector('ol')
        if (!strip) return
        const distance = () => strip.scrollWidth - strip.clientWidth
        gsap.to(strip, {
          scrollLeft: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'center center',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="timeline-heading" className="overflow-hidden bg-void py-24 text-bone sm:py-32">
      <Container className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading id="timeline-heading" lead="The timeline" accent="Phase by phase" />
        <Link
          to="/timeline"
          className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-mute underline-offset-4 transition-colors hover:text-bone hover:underline"
        >
          Open the full timeline →
        </Link>
      </Container>

      <div className="-rotate-1">
        <div className="bg-paper-dim text-ink">
          <div aria-hidden="true" className="sprockets h-4" />
          <ol
            className="flex snap-x snap-mandatory gap-1.5 lg:snap-none overflow-x-auto px-5 py-1.5 [scrollbar-width:none] sm:px-8 lg:px-12"
            aria-label="MCU phases"
          >
            {phases.map((phase) => {
              const from = phase.opener.releaseDate.slice(0, 4)
              const to = phase.closer.releaseDate.slice(0, 4)
              const years = from === to ? from : `${from}–${to.slice(2)}`
              const counts = [
                phase.films && `${phase.films} ${phase.films === 1 ? 'film' : 'films'}`,
                phase.series && `${phase.series} series`,
              ]
                .filter(Boolean)
                .join(' · ')
              return (
                <li key={phase.number} className="flex w-[78vw] max-w-[22rem] shrink-0 snap-start sm:w-[22rem]">
                  <Link
                    to={`/timeline#${phase.opener.id}`}
                    aria-label={`Phase ${phase.number}, ${years}: ${counts}. Opens with ${phase.opener.title}. View on the timeline`}
                    className="group flex w-full flex-col justify-between gap-8 bg-void p-6 text-bone outline-offset-[-4px] transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-red"
                  >
                    <div className="flex items-center justify-between">
                      <Eyebrow className="text-mute">{phase.saga}</Eyebrow>
                      <Eyebrow className="text-red-bright">{years}</Eyebrow>
                    </div>
                    <div>
                      <p className="font-display text-[clamp(4rem,9vw,6rem)] uppercase leading-[0.85]">
                        Phase
                        <br />
                        {String(phase.number).padStart(2, '0')}
                      </p>
                      <p className="mt-4 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-mute">
                        {counts}
                        {phase.scheduled > 0 && <span className="text-red-bright"> · {phase.scheduled} coming</span>}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-line pt-4">
                      <Eyebrow className="text-mute">Opens with</Eyebrow>
                      <p className="text-lg leading-snug">{phase.opener.title}</p>
                      <span className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-mute transition-colors group-hover:text-red-bright">
                        See it on the timeline →
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
          <div aria-hidden="true" className="sprockets h-4" />
        </div>
      </div>

      <Container className="mt-6">
        <Eyebrow className="text-mute">Release order · Story order on the full timeline</Eyebrow>
      </Container>
    </section>
  )
}
