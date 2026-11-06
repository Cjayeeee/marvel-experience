import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { OmdbNotice } from '@/features/titles/OmdbNotice'
import { useTitles } from '@/features/titles/queries'
import { TitleCard } from '@/features/titles/TitleCard'
import { useOmdbError } from '@/features/titles/useOmdbError'
import { cn } from '@/lib/cn'
import { useReveals } from '@/motion/useReveals'
import type { TitleSort } from '@/services/titles.service'
import type { TitleKind } from '@/types/title'

const PHASES = ['1', '2', '3', '4', '5', '6', 'netflix'] as const
const SORTS: { value: TitleSort; label: string }[] = [
  { value: 'release-asc', label: 'Release order' },
  { value: 'release-desc', label: 'Newest first' },
  { value: 'chrono', label: 'Story order' },
  { value: 'title', label: 'Title A–Z' },
]

const copy: Record<TitleKind, { lead: string; accent: string; file: string; other: { to: string; label: string } }> = {
  film: { lead: 'Now', accent: 'Showing', file: 'Screenings · Feature films', other: { to: '/series', label: 'Series →' } },
  series: { lead: 'Every', accent: 'Episode', file: 'Screenings · Series', other: { to: '/movies', label: '← Films' } },
}

/** /movies and /series: the catalogue as a poster wall. */
export function TitlesPage({ kind }: { kind: TitleKind }) {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const phase = params.get('phase') ?? undefined
  const sort = (params.get('sort') as TitleSort | null) ?? 'release-asc'
  const [text, setText] = useState(q)

  const set = useCallback(
    (key: string, value: string | undefined) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true, preventScrollReset: true },
      ),
    [setParams],
  )

  // Debounced search → URL.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (text.trim() !== q) set('q', text.trim() || undefined)
    }, 250)
    return () => window.clearTimeout(id)
  }, [text, q, set])

  const { data = [], isPending } = useTitles({ kind, q: q || undefined, phase, sort })
  const firstError = useOmdbError()
  const c = copy[kind]

  return (
    <div ref={root}>
      <title>{`${kind === 'film' ? 'Movies' : 'Series'} | Multiverse`}</title>

      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">{c.file}</Eyebrow>
            <Link to={c.other.to} className="font-mono text-[0.72rem] tracking-[0.12em] uppercase underline-offset-4 hover:underline">
              {c.other.label}
            </Link>
          </div>
          <h1 data-reveal="heading" className="font-display text-giant uppercase">
            <span className="block">{c.lead}</span>
            <span className="block text-red">{c.accent}</span>
          </h1>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <label className="flex-1">
              <Eyebrow as="span" className="text-ink-mute">
                Search titles
              </Eyebrow>
              <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={kind === 'film' ? 'Try “Avengers” or “Guardians”' : 'Try “Loki” or “Daredevil”'}
                className="mt-2 h-14 w-full border-b-2 border-ink bg-transparent text-[clamp(1.2rem,2.2vw,1.6rem)] outline-none placeholder:text-ink-mute/60 focus:border-red"
              />
            </label>
            <label className="flex flex-col gap-2">
              <Eyebrow as="span" className="text-ink-mute">
                Sort
              </Eyebrow>
              <select
                value={sort}
                onChange={(e) => set('sort', e.target.value === 'release-asc' ? undefined : e.target.value)}
                className="h-12 rounded-full border border-ink bg-transparent px-4 font-mono text-[0.75rem] tracking-[0.1em] uppercase"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Phase</legend>
            <PhaseChip active={!phase} onClick={() => set('phase', undefined)} label="All phases" />
            {PHASES.filter((p) => kind === 'series' || p !== 'netflix').map((p) => (
              <PhaseChip
                key={p}
                active={phase === p}
                onClick={() => set('phase', phase === p ? undefined : p)}
                label={p === 'netflix' ? 'Netflix era' : `Phase ${p}`}
              />
            ))}
          </fieldset>
        </Container>
      </section>

      <section aria-label="Titles" className="bg-void pt-10 pb-24 text-bone sm:pb-32">
        <Container className="flex flex-col gap-8">
          <OmdbNotice error={firstError} />
          <p aria-live="polite" className="font-mono text-[0.75rem] tracking-[0.12em] uppercase">
            {isPending ? 'Loading…' : `${data.length} ${kind === 'film' ? (data.length === 1 ? 'film' : 'films') : 'series'}`}
          </p>

          {!isPending && data.length === 0 ? (
            <div className="flex flex-col items-start gap-4 border border-dashed border-line px-6 py-12">
              <p className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.9]">Nothing on this reel</p>
              <p className="text-mute">No titles match. Try another search or phase.</p>
              <button
                type="button"
                onClick={() => {
                  setText('')
                  setParams(new URLSearchParams(), { replace: true })
                }}
                className="font-mono text-[0.72rem] tracking-[0.12em] text-red-bright uppercase underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.map((t, i) => (
                <li
                  key={t.id}
                  className="animate-[card-in_0.6s_var(--ease-cinematic)_both]"
                  style={{ animationDelay: `${Math.min(i, 15) * 30}ms` }}
                >
                  <TitleCard title={t} />
                </li>
              ))}
            </ul>
          )}

          <Eyebrow className="border-t border-line pt-6 text-mute">
            Catalogue curated for this fan archive · Posters, plots and ratings from OMDb (CC BY-NC 4.0)
          </Eyebrow>
        </Container>
      </section>
    </div>
  )
}

function PhaseChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-10 rounded-full border px-4 font-mono text-[0.72rem] tracking-[0.12em] uppercase transition-colors',
        active ? 'border-red bg-red text-white' : 'border-ink/40 hover:border-ink',
      )}
    >
      {label}
    </button>
  )
}
