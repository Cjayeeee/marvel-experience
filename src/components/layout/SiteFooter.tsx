import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/motion/gsap'
import { OrbitMark } from '@/components/brand/OrbitMark'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { AvailabilityBadge, CreatorLinks } from '@/components/brand/CreatorCredit'
import { creator } from '@/config/creator'
import { footerNav } from '@/config/navigation'

/** Footer: link columns, then the giant cropped wordmark over a planet arc. */
export function SiteFooter() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-footer-mark]', {
          yPercent: 70,
          ease: 'none',
          scrollTrigger: { trigger: '[data-footer-mark]', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
        })
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="relative overflow-hidden bg-void pt-20 text-bone sm:pt-28">
      <Container className="relative z-10 grid gap-12 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div className="flex max-w-sm flex-col gap-5">
          <OrbitMark className="size-10" />
          <p className="text-[0.95rem] leading-relaxed text-mute">
            An archive of every reality, every hero and every possibility, built
            by a fan, for fans.
          </p>
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <p className="text-[0.95rem]">
              Designed &amp; built by{' '}
              <a href={creator.portfolio} target="_blank" rel="noopener" className="font-semibold hover:text-red-bright">
                {creator.name}
              </a>
            </p>
            <AvailabilityBadge />
            <CreatorLinks className="text-[0.9rem] text-bone/85" />
          </div>
        </div>

        {footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <Eyebrow as="h2" className="mb-4 text-mute">
              {group.heading}
            </Eyebrow>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[0.98rem] transition-colors hover:text-red-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <Container className="relative z-10 mt-16 flex flex-col gap-2 border-t border-line pt-6 pb-4 text-[0.8rem] leading-relaxed text-mute sm:flex-row sm:justify-between">
        <p>
          Unofficial fan project. Not affiliated with, endorsed or sponsored by
          Marvel Entertainment or The Walt Disney Company.
        </p>
        <div className="flex shrink-0 flex-col gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] sm:items-end">
          <p>
            Film data: <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">OMDb API</a> (CC BY-NC 4.0) · Non-commercial
          </p>
          <p>
            Earth texture: <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Solar System Scope</a> (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">CC BY 4.0</a>) · Adapted to halftone
          </p>
        </div>
      </Container>

      {/* Planet arc + cropped wordmark (Orbita's closing gesture) */}
      <div aria-hidden="true" className="relative mt-6 h-[clamp(7rem,22vw,20rem)] select-none">
        <div className="absolute top-[38%] left-1/2 aspect-square w-[160%] -translate-x-1/2 rounded-full border-t border-line bg-gradient-to-b from-void-raised to-void" />
        <p data-footer-mark className="absolute inset-x-0 top-0 text-center font-display text-mega leading-[0.8] tracking-[-0.01em] text-bone">
          MULTIVERSE
        </p>
      </div>
    </footer>
  )
}
