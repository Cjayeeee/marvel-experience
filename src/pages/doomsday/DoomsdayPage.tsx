import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { titles } from '@/data/curated/titles'
import { FavouriteButton } from '@/features/library/FavouriteButton'
import { WatchControl } from '@/features/library/WatchControl'
import { useLibrary } from '@/features/library/useLibrary'
import { cn } from '@/lib/cn'
import { getTimeline } from '@/services/titles.service'
import type { Title } from '@/types/title'
import { StainedGlass } from './StainedGlass'

const DOOMSDAY_ID = 'avengers-doomsday'
const DAY = 86_400_000

/** Re-renders every `ms` milliseconds with the current time. */
function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

/** Midnight at the start of the release day, in the visitor's own time zone. */
function releaseMoment(isoDate: string): number {
  const [y = 0, m = 1, d = 1] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

/** `date` plus `n` calendar months, keeping the time; day clamped to the month's length (Jan 31 + 1 → Feb 28/29). */
function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  return d
}

/** Time left as calendar months, then days, hours, minutes and seconds. */
function split(from: number, to: number) {
  if (to <= from) return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 }
  const start = new Date(from)
  let months = 0
  while (addMonths(start, months + 1).getTime() <= to) months++
  const s = Math.floor((to - addMonths(start, months).getTime()) / 1000)
  return {
    months,
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalDays: Math.floor((to - from) / DAY),
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const pad = (n: number) => String(n).padStart(2, '0')

/** /doomsday: live countdown to Avengers: Doomsday, plus a catch-up plan. */
export function DoomsdayPage() {
  const film = titles.find((t) => t.id === DOOMSDAY_ID)
  const now = useNow(1000)
  if (!film) return null

  const target = releaseMoment(film.releaseDate)
  const left = target - now
  const released = left <= 0
  const t = split(now, target)
  const dateLabel = new Date(target).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="theme-doom bg-void text-bone">
      <title>{released ? 'Avengers: Doomsday is out | Multiverse' : `Doomsday in ${t.totalDays} days | Multiverse`}</title>

      {/* ─── Countdown ─── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16">
        {/* Backlit stained-glass window, light rays, and vignettes for legibility */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <StainedGlass className="absolute inset-x-0 top-0 h-full w-full opacity-60" />
          <div className="doom-rays absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_55%,rgb(4_8_5/0.88),rgb(4_8_5/0.45)_60%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-void to-transparent" />
          {/* Keep the header legible: its blend mode inverts over bright glass */}
          <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-void via-void/85 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-void/80 to-transparent" />
        </div>
        <Container className="relative flex flex-col items-center gap-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="absolute inset-0 rounded-full bg-red opacity-75 motion-safe:animate-ping" />
              <span className="relative size-2.5 rounded-full bg-red" />
            </span>
            <Eyebrow className="text-mute">{released ? 'Event live · Phase Six' : 'Incoming · Phase Six'}</Eyebrow>
          </div>

          <h1 className="flex flex-col items-center gap-3 font-display uppercase">
            <span className="doom-metal text-[clamp(3.5rem,15vw,13rem)] leading-[0.9] tracking-[0.02em]">Avengers</span>
            <span className="flex w-full items-center justify-center gap-4 sm:gap-6">
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-transparent to-red sm:w-24" />
              <span className="doom-glow text-[clamp(1.6rem,5.5vw,3.6rem)] leading-none tracking-[0.42em] [margin-right:-0.42em]">
                Doomsday
              </span>
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-l from-transparent to-red sm:w-24" />
            </span>
          </h1>

          {released ? (
            <p className="max-w-xl text-xl leading-relaxed text-bone/90">
              It’s here. Avengers: Doomsday has been in theaters since {dateLabel}
              {left < -DAY ? ` (${Math.floor(-left / DAY)} days ago)` : ''}.
            </p>
          ) : (
            <>
              <div
                role="timer"
                aria-label={`${t.months ? `${plural(t.months, 'month')}, ` : ''}${plural(t.days, 'day')}, ${plural(t.hours, 'hour')} and ${plural(t.minutes, 'minute')} until release`}
              >
                <ol aria-hidden="true" className="grid grid-cols-5 gap-1.5 sm:gap-4">
                  {(
                    [
                      ['Months', t.months],
                      ['Days', t.days],
                      ['Hours', t.hours],
                      ['Minutes', t.minutes],
                      ['Seconds', t.seconds],
                    ] as const
                  ).map(([label, value]) => (
                    <li
                      key={label}
                      className="flex min-w-0 flex-col items-center gap-2 border border-red/30 bg-void-raised/70 px-1 pt-3 pb-2.5 shadow-[inset_0_1px_0_rgb(141_255_156/0.12)] backdrop-blur-md sm:min-w-[8rem] sm:px-4 sm:pt-6 sm:pb-4"
                    >
                      <span
                        key={value}
                        className={cn(
                          'font-display text-[clamp(2rem,9vw,6.5rem)] leading-none tabular-nums',
                          label === 'Seconds' ? 'doom-glow motion-safe:animate-[card-in_0.45s_var(--ease-cinematic)]' : 'doom-metal',
                        )}
                      >
                        {pad(value)}
                      </span>
                      <span className="font-mono text-[0.55rem] tracking-[0.08em] text-mute uppercase sm:text-[0.7rem] sm:tracking-[0.16em]">{label}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="text-mute">
                In theaters <strong className="font-semibold text-bone">{dateLabel}</strong>. Counting down to midnight in
                your time zone.
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <WatchControl title={film} />
            <FavouriteButton kind="title" id={film.id} name={film.title} variant="pill" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[0.72rem] tracking-[0.12em] uppercase">
            <Link to={`/titles/${film.id}`} className="underline decoration-red underline-offset-4 hover:text-red-bright">
              Title file
            </Link>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent('Avengers Doomsday official trailer')}`}
              target="_blank"
              rel="noopener"
              className="underline decoration-red underline-offset-4 hover:text-red-bright"
            >
              Watch the trailers ↗<span className="sr-only"> (opens YouTube in a new tab)</span>
            </a>
          </div>
        </Container>
      </section>

      {!released ? <CatchUp daysLeft={Math.max(1, t.totalDays)} /> : null}

      <Container className="border-t border-line py-8">
        <Eyebrow className="text-mute">
          {film.note ?? ''} US release date shown; other countries may open a day earlier or later.
        </Eyebrow>
      </Container>
    </div>
  )
}

/** How much of the story you've watched, and the pace needed to finish before release. */
function CatchUp({ daysLeft }: { daysLeft: number }) {
  const [story, setStory] = useState<Title[]>([])
  const watchlist = useLibrary((s) => s.library.watchlist)
  const ready = useLibrary((s) => s.status === 'ready')

  useEffect(() => {
    let alive = true
    void getTimeline('chronological').then((items) => alive && setStory(items))
    return () => {
      alive = false
    }
  }, [])

  const releasedTitles = story.filter((t) => !t.scheduled)
  const watched = releasedTitles.filter((t) => watchlist[t.id]?.status === 'watched').length
  const remaining = releasedTitles.length - watched
  const next = releasedTitles.find((t) => watchlist[t.id]?.status !== 'watched')
  const loaded = ready && releasedTitles.length > 0
  const pct = loaded ? Math.round((watched / releasedTitles.length) * 100) : 0

  let pace = ''
  if (loaded && remaining > 0) {
    const perDay = remaining / daysLeft
    pace =
      perDay >= 1
        ? `about ${Math.ceil(perDay)} a day`
        : `one every ${Math.max(1, Math.floor(daysLeft / remaining))} day${Math.floor(daysLeft / remaining) === 1 ? '' : 's'}`
  }

  return (
    <section aria-labelledby="catch-up" className="relative border-t border-line bg-void py-16 text-bone sm:py-24">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="flex flex-col gap-5">
          <Eyebrow className="text-mute">Mission briefing</Eyebrow>
          <h2 id="catch-up" className="font-display text-huge uppercase">
            <span className="doom-metal block">Catch up</span>
            <span className="doom-glow block">Before it lands</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-bone/80">
            {!loaded
              ? 'Checking your watch history…'
              : remaining === 0
                ? 'You’ve watched every released title. You’re ready for Doomsday.'
                : `${remaining} of ${releasedTitles.length} titles to go in ${daysLeft} days. Watch ${pace} to finish in time.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/timeline?order=chronological">
              Open the story-order timeline
            </ButtonLink>
          </div>
        </div>

        <div className="flex flex-col gap-6 border border-red/30 bg-void-raised/80 p-6 sm:p-8">
          <p className="flex items-baseline gap-3">
            <span className="font-display text-6xl leading-none">
              {loaded ? watched : '–'}
              <span className="text-mute">/{loaded ? releasedTitles.length : '–'}</span>
            </span>
            <Eyebrow as="span" className="text-mute">
              watched
            </Eyebrow>
          </p>
          <div
            role="progressbar"
            aria-label="Titles watched"
            aria-valuemin={0}
            aria-valuemax={releasedTitles.length || 1}
            aria-valuenow={watched}
            className="h-2 w-full overflow-hidden bg-line"
          >
            <div className="h-full bg-red transition-[width] duration-700 ease-(--ease-cinematic)" style={{ width: `${pct}%` }} />
          </div>
          {loaded && next ? (
            <Link to={`/titles/${next.id}`} className="group flex flex-col gap-1 border-l-2 border-red pl-4">
              <Eyebrow className="text-red">Next up · story order</Eyebrow>
              <span className="font-display text-2xl leading-tight uppercase group-hover:text-red-bright">{next.title}</span>
            </Link>
          ) : (
            <div aria-hidden="true" className="h-14" />
          )}
        </div>
      </Container>
    </section>
  )
}
