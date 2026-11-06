import { useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { AvailabilityBadge, CreatorLinks } from '@/components/brand/CreatorCredit'
import { creator } from '@/config/creator'
import { gsap, useGSAP } from '@/motion/gsap'

/**
 * Stepped statement with inline chips (Orbita's "creative cluster" block).
 * On scroll the lines slide in from alternating sides and brighten, and the
 * chips spin into their slots, tied to scroll position, so it can be scrubbed.
 */
export function ManifestoSection() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: q('h2')[0], start: 'top 90%', end: 'bottom 55%', scrub: 0.8 },
        })
        q<HTMLElement>('[data-line]').forEach((line, i) => {
          tl.from(line, { xPercent: i % 2 === 0 ? -14 : 14, opacity: 0.12, duration: 1 }, i * 0.18)
        })
        tl.from(q('[data-chip]'), { scale: 0, rotate: -120, duration: 0.8, stagger: 0.3 }, 0.3)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="manifesto" className="overflow-hidden bg-void pb-24 text-bone sm:pb-36">
      <Container className="flex flex-col gap-14">
        <h2 id="manifesto" className="font-display text-huge uppercase">
          <span data-line className="block">
            Multiverse:
          </span>
          <span data-line className="flex flex-wrap items-center gap-x-[0.25em] pl-[8%]">
            an archive
            <span
              data-chip
              aria-hidden="true"
              className="halftone inline-block h-[0.72em] w-[1.9em] rounded-full bg-red text-black/40"
            />
          </span>
          <span data-line className="block pl-[22%]">
            of every reality,
          </span>
          <span data-line className="flex flex-wrap items-center gap-x-[0.25em] pl-[4%]">
            <span
              data-chip
              aria-hidden="true"
              className="relative inline-block h-[0.72em] w-[1.5em] overflow-hidden rounded-full bg-paper"
            >
              <span className="absolute inset-y-0 left-[18%] w-[3px] bg-red" />
              <span className="absolute inset-x-[30%] top-[38%] h-[3px] bg-ink" />
              <span className="absolute inset-x-[30%] top-[58%] h-[3px] bg-ink/60" />
            </span>
            catalogued
          </span>
          <span data-line className="block pl-[30%] text-red">
            file by file.
          </span>
        </h2>

        <div data-reveal="stagger" className="grid gap-8 border-t border-line pt-8 md:grid-cols-[1fr_1fr_1fr]">
          <Eyebrow className="text-mute">About this archive</Eyebrow>
          <p className="leading-relaxed text-bone/85">
            Heroes, villains and variants from the comics, the films and the
            series, each one filed with the universe it belongs to and the
            realities it has crossed into.
          </p>
          <p className="leading-relaxed text-bone/85">
            Every fact is sourced. Where the record is editorial (power ratings,
            fan timeline placements), it says so on the file.
          </p>
        </div>

        <div
          data-reveal="up"
          className="flex flex-col gap-5 border-t border-line pt-8 md:flex-row md:items-center md:justify-between md:gap-10"
        >
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-mute">Made by</Eyebrow>
            <p className="max-w-2xl text-lg leading-relaxed text-bone/90">
              Designed and built by{' '}
              <a href={creator.portfolio} target="_blank" rel="noopener" className="font-semibold text-bone hover:text-red-bright">
                {creator.name}
              </a>
              . If you’d like something like this for your own project, I’m taking on freelance work.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 md:items-end">
            <AvailabilityBadge />
            <CreatorLinks className="md:justify-end" />
          </div>
        </div>
      </Container>
    </section>
  )
}
