import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { OmdbNotice } from '@/features/titles/OmdbNotice'
import { useTimeline } from '@/features/titles/queries'
import { TitlePoster } from '@/features/titles/TitlePoster'
import { useOmdbError } from '@/features/titles/useOmdbError'
import { cn } from '@/lib/cn'
import { Flip, gsap } from '@/motion/gsap'
import { getLenis } from '@/motion/lenisInstance'
import { prefersReducedMotion } from '@/motion/tokens'
import { phaseLabel, type TimelineOrder } from '@/services/titles.service'
import type { Title } from '@/types/title'

const BADGES = {
  official: { label: 'Official order', className: 'border-bone/50 text-bone' },
  fan: { label: 'Fan placement', className: 'border-gold text-gold' },
  scheduled: { label: 'Scheduled', className: 'border-red bg-red text-white' },
} as const

/** /timeline — the MCU in release order or story order, phase by phase. */
export function TimelinePage() {
  const [params, setParams] = useSearchParams()
  const order: TimelineOrder = params.get('order') === 'chronological' ? 'chronological' : 'release'
  const { data: items = [], isPending } = useTimeline(order)
  const omdbError = useOmdbError()
  const location = useLocation()
  const list = useRef<HTMLOListElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  const switchOrder = (next: TimelineOrder) => {
    if (next === order) return
    // Record every card's position before React reorders them.
    if (list.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(list.current.querySelectorAll('[data-flip-id]'))
    }
    setParams(next === 'release' ? {} : { order: next }, { replace: true, preventScrollReset: true })
  }

  // After the reorder renders, animate each card from its old spot to its new one.
  useLayoutEffect(() => {
    const state = flipState.current
    if (!state || !list.current) return
    flipState.current = null
    Flip.from(state, {
      targets: list.current.querySelectorAll('[data-flip-id]'),
      duration: 0.9,
      ease: 'power3.inOut',
      stagger: 0.008,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.3 }),
    })
  }, [items])

  // Deep link: /timeline#avengers-endgame scrolls to and highlights that title.
  const highlight = decodeURIComponent(location.hash.replace('#', '')) || null
  useEffect(() => {
    const id = decodeURIComponent(location.hash.replace('#', ''))
    if (!id || isPending) return
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(y, { duration: 1.2 })
    else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [location.hash, isPending])

  const counts = useMemo(
    () => ({
      films: items.filter((t) => t.kind === 'film').length,
      series: items.filter((t) => t.kind === 'series').length,
    }),
    [items],
  )

  return (
    <div className="bg-void text-bone">
      <title>{`MCU Timeline (${order === 'release' ? 'release order' : 'story order'}) — Multiverse`}</title>

      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">Chronology · Earth-199999</Eyebrow>
            <Eyebrow className="text-ink-mute">
              {counts.films} films · {counts.series} series
            </Eyebrow>
          </div>
          <h1 className="font-display text-giant uppercase">
            <span className="block">The</span>
            <span className="block text-red">Timeline</span>
          </h1>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div role="group" aria-label="Order" className="inline-flex w-fit rounded-full border-2 border-ink p-1">
              {(['release', 'chronological'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => switchOrder(o)}
                  aria-pressed={order === o}
                  className={cn(
                    'h-11 rounded-full px-5 font-display text-base tracking-[0.04em] uppercase transition-colors',
                    order === o ? 'bg-ink text-paper' : 'hover:text-red',
                  )}
                >
                  {o === 'release' ? 'Release order' : 'Story order'}
                </button>
              ))}
            </div>
            <p className="max-w-md text-[0.95rem] leading-relaxed text-ink-mute">
              {order === 'release'
                ? 'Every film and series in the order audiences saw them, grouped by phase.'
                : 'The order events happen in the story — Marvel Studios’ own Disney+ timeline. Titles it leaves out are placed by fans and labelled.'}
            </p>
          </div>

          <ul className="flex flex-wrap gap-2" aria-label="Legend">
            {Object.values(BADGES).map((b) => (
              <li key={b.label} className="rounded-full border border-ink/40 px-3 py-1 font-mono text-[0.65rem] tracking-[0.12em] uppercase">
                {b.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label={order === 'release' ? 'Release order' : 'Story order'} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <OmdbNotice error={omdbError} />

          <ol ref={list} className="relative flex flex-col gap-4 md:gap-0">
            {/* Spine */}
            <span aria-hidden="true" className="absolute top-0 bottom-0 left-[1.15rem] w-px bg-line md:left-1/2" />
            {items.map((t, i) => {
              const showPhase = order === 'release' && (i === 0 || items[i - 1]?.phase !== t.phase)
              return (
                <Fragment key={t.id}>
                  {showPhase ? (
                    <li data-flip-id={`phase-${t.phase ?? 'tv'}-${i}`} className="relative z-10 py-8 md:text-center">
                      <span className="ml-10 inline-block bg-void px-3 font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-red md:ml-0">
                        {phaseLabel(t.phase)}
                      </span>
                    </li>
                  ) : null}
                  <TimelineEntry
                    title={t}
                    number={order === 'release' ? i + 1 : (t.chronoIndex ?? i + 1)}
                    side={i % 2 === 0 ? 'left' : 'right'}
                    highlighted={highlight === t.id}
                  />
                </Fragment>
              )
            })}
          </ol>

          <Eyebrow className="border-t border-line pt-6 text-mute">
            Story order follows Disney+’s “Timeline order” for Marvel Studios titles · Fan placements are not official ·
            Films and live-action series, plus What If…? · Posters from OMDb
          </Eyebrow>
        </Container>
      </section>
    </div>
  )
}

function TimelineEntry({
  title,
  number,
  side,
  highlighted,
}: {
  title: Title
  number: number
  side: 'left' | 'right'
  highlighted: boolean
}) {
  const badge = title.scheduled ? BADGES.scheduled : title.placement === 'fan' ? BADGES.fan : null
  return (
    <li
      id={title.id}
      data-flip-id={title.id}
      className={cn(
        'relative grid grid-cols-[2.3rem_minmax(0,1fr)] items-center md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:py-3',
      )}
    >
      {/* Node on the spine */}
      <span
        aria-hidden="true"
        className={cn(
          'relative z-10 col-start-1 row-start-1 flex size-9 items-center justify-center rounded-full border bg-void font-mono text-[0.68rem] md:col-start-2 md:mx-auto',
          title.scheduled ? 'border-red text-red-bright' : 'border-line text-mute',
        )}
      >
        {String(number).padStart(2, '0')}
      </span>

      <Link
        to={`/titles/${title.id}`}
        className={cn(
          'group col-start-2 row-start-1 ml-3 flex items-center gap-4 border p-3 transition-colors duration-300 hover:border-red md:ml-0',
          side === 'left' ? 'md:col-start-1 md:mr-4 md:flex-row-reverse md:text-right' : 'md:col-start-3 md:ml-4',
          'border-line bg-void-raised',
          highlighted && 'animate-[spotlight_2.8s_ease-out_both]',
        )}
      >
        <TitlePoster title={title} className="aspect-[2/3] w-16 shrink-0 sm:w-20" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className={cn('flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.62rem] tracking-[0.12em] text-mute uppercase', side === 'left' && 'md:justify-end')}>
            <span>{title.kind === 'film' ? 'Film' : 'Series'}</span>
            <span>{title.releaseDate.slice(0, 4)}</span>
            <span>{phaseLabel(title.phase)}</span>
          </span>
          <span className="font-display text-[clamp(1.1rem,2vw,1.6rem)] uppercase leading-[1.02] group-hover:text-red-bright">
            {title.title}
          </span>
          {badge ? (
            <span className={cn('w-fit rounded-full border px-2 py-0.5 font-mono text-[0.58rem] tracking-[0.12em] uppercase', badge.className, side === 'left' && 'md:ml-auto')}>
              {badge.label}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  )
}
