import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/motion/gsap'
import { OrbitMark } from '@/components/brand/OrbitMark'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { teamRosters } from '@/data/curated/home'
import { teams } from '@/data/curated/teams'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { cn } from '@/lib/cn'

const stickerStyles = [
  'bg-ink text-paper -rotate-3',
  'bg-red text-white rotate-2',
  'bg-paper-dim text-ink border border-ink -rotate-1',
  'bg-ink text-paper rotate-3',
  'bg-paper-dim text-ink border border-ink -rotate-2',
  'bg-red text-white rotate-1',
]

/** Border colour for the member faces, matching each sticker's background. */
const stickerRing = ['border-ink', 'border-red', 'border-paper-dim', 'border-ink', 'border-paper-dim', 'border-red']

/** Tilted sticker badges, one per team (Orbita's loyalty badges). */
export function TeamsSection() {
  const root = useRef<HTMLElement>(null)

  // Stickers drop onto the page one after another, settling at their tilt.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const stickers = gsap.utils.toArray<HTMLElement>('[data-sticker]', root.current)
        gsap.from(stickers, {
          y: -140,
          autoAlpha: 0,
          rotate: (i: number) => (i % 2 === 0 ? -24 : 24),
          duration: 1,
          ease: 'back.out(1.5)',
          stagger: 0.09,
          scrollTrigger: { trigger: stickers[0], start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="teams-heading"
      className="paper-grain overflow-x-clip bg-paper py-24 text-ink sm:py-32"
    >
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="teams-heading" lead="Assemble" accent="Every team" />
          <p className="max-w-sm leading-relaxed text-ink-mute">
            Browse the rosters — or pick six characters and build a squad of your own.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-3">
          {teams.map((team, index) => {
            const roster = teamRosters[team.slug]
            const ring = stickerRing[index % stickerRing.length]
            return (
              <li key={team.slug} data-sticker>
                <Link
                  to={`/characters?team=${team.slug}`}
                  aria-label={roster?.count ? `${team.name}: ${roster.count} characters in the archive` : team.name}
                  className={cn(
                    'group flex aspect-[4/5] flex-col sm:aspect-[5/4] justify-between rounded-[1.75rem] p-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-(--ease-cinematic) hover:rotate-0 hover:scale-[1.03] sm:p-7',
                    stickerStyles[index % stickerStyles.length],
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Eyebrow className="opacity-75">{team.line}</Eyebrow>
                    <OrbitMark className="size-7 transition-transform duration-700 group-hover:rotate-180" />
                  </div>
                  {roster && roster.count > 0 && (
                    <div className="flex items-center gap-3">
                      <ul className="flex -space-x-3 sm:-space-x-4" aria-hidden="true">
                        {roster.faces.map((face, i) => (
                          <li
                            key={face.slug}
                            className={cn(
                              'size-10 overflow-hidden rounded-full border-2 transition-transform duration-500 ease-(--ease-cinematic) group-hover:-translate-y-1 sm:size-14',
                              ring,
                              i >= 3 && 'max-sm:hidden',
                            )}
                            style={{ transitionDelay: `${i * 40}ms` }}
                          >
                            <CharacterArt character={face} decorative tone="void" className="size-full" />
                          </li>
                        ))}
                      </ul>
                      <span className="font-mono text-[0.7rem] uppercase leading-tight tracking-[0.12em] opacity-75">
                        {roster.count}
                        <span className="max-sm:hidden"> in the archive</span>
                      </span>
                    </div>
                  )}
                  <span className="font-display text-[clamp(1.35rem,4.2vw,3.5rem)] uppercase leading-[0.9] [overflow-wrap:anywhere]">
                    {team.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div>
          <ButtonLink to="/team-builder" variant="ink" size="lg">
            Build your team
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
