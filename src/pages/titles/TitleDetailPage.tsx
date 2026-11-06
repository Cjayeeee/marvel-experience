import { useRef, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { FavouriteButton } from '@/features/library/FavouriteButton'
import { WatchControl } from '@/features/library/WatchControl'
import { OmdbNotice } from '@/features/titles/OmdbNotice'
import { useAdjacentTitles, useCharactersInTitle, useTitle, useTitleDetails } from '@/features/titles/queries'
import { TitlePoster } from '@/features/titles/TitlePoster'
import { useReveals } from '@/motion/useReveals'
import { phaseLabel } from '@/services/titles.service'
import type { Title } from '@/types/title'

/** /titles/:id: briefing page for one film or series. */
export function TitleDetailPage() {
  const { id = '' } = useParams()
  const { data: title, isPending } = useTitle(id)
  if (isPending) return <section className="min-h-[90dvh] bg-void" aria-busy="true" />
  if (!title) return <TitleNotFound />
  return <Briefing key={title.id} title={title} />
}

function Briefing({ title }: { title: Title }) {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  const details = useTitleDetails(title)
  const { data: cast = [] } = useCharactersInTitle(title)
  const { data: adjacent } = useAdjacentTitles(title.id)
  const d = details.data
  const year = title.releaseDate.slice(0, 4)
  const released = new Date(`${title.releaseDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const trailerSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title.title} ${year} official trailer Marvel`)}`

  return (
    <div ref={root} className="bg-void text-bone">
      <title>{`${title.title} (${year}) | Multiverse`}</title>

      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <Link
              to={title.kind === 'film' ? '/movies' : '/series'}
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase underline-offset-4 hover:underline"
            >
              ← All {title.kind === 'film' ? 'films' : 'series'}
            </Link>
            <Eyebrow className="text-mute">
              {phaseLabel(title.phase)} · {title.kind === 'film' ? 'Feature film' : 'Series'} · {year}
            </Eyebrow>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
            {/* Poster */}
            <div data-reveal="up" className="mx-auto w-full max-w-xs lg:max-w-none">
              <div className="-rotate-1 bg-bone p-2.5 pb-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
                <TitlePoster title={title} large eager decorative={false} className="aspect-[2/3]" />
                <p className="mt-2 font-mono text-[0.65rem] tracking-[0.14em] text-ink-mute uppercase">
                  {title.scheduled ? `Scheduled · ${released}` : `Released · ${released}`}
                </p>
              </div>
            </div>

            {/* Briefing */}
            <div className="flex flex-col gap-8">
              <h1 data-reveal="heading" className="font-display text-[clamp(2.8rem,7vw,6.5rem)] uppercase leading-[0.9] [overflow-wrap:anywhere]">
                {title.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <WatchControl title={title} />
                <FavouriteButton kind="title" id={title.id} name={title.title} variant="pill" />
              </div>

              {d ? (
                <ul className="flex flex-wrap gap-2">
                  {[d.rated, d.runtime, ...d.genres, d.totalSeasons ? `${d.totalSeasons} seasons` : null]
                    .filter((x): x is string => Boolean(x))
                    .map((x) => (
                      <li key={x} className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] tracking-[0.1em] uppercase">
                        {x}
                      </li>
                    ))}
                </ul>
              ) : null}

              <OmdbNotice error={details.error} />
              {details.isPending && !details.error ? (
                <div aria-hidden="true" className="flex flex-col gap-2">
                  <div className="h-4 w-full animate-pulse bg-void-card" />
                  <div className="h-4 w-11/12 animate-pulse bg-void-card" />
                  <div className="h-4 w-3/4 animate-pulse bg-void-card" />
                </div>
              ) : null}
              {d?.plot ? <p className="max-w-3xl text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-bone/90">{d.plot}</p> : null}

              {d ? (
                <dl className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
                  {d.directors.length ? <Credit label={d.directors.length > 1 ? 'Directed by' : 'Director'}>{d.directors.join(', ')}</Credit> : null}
                  {d.writers.length ? <Credit label="Written by">{d.writers.slice(0, 4).join(', ')}</Credit> : null}
                  {d.actors.length ? <Credit label="Starring">{d.actors.join(', ')}</Credit> : null}
                  {d.boxOffice ? <Credit label="Box office (US)">{d.boxOffice}</Credit> : null}
                  {d.awards ? <Credit label="Awards">{d.awards}</Credit> : null}
                </dl>
              ) : null}

              {d?.ratings.length ? (
                <div className="flex flex-col gap-3">
                  <Eyebrow className="text-mute">Ratings · via OMDb</Eyebrow>
                  <ul className="flex flex-wrap gap-3">
                    {d.ratings.map((r) => (
                      <li key={r.source} className="flex min-w-[9rem] flex-col gap-1 border border-line px-4 py-3">
                        <span className="font-display text-3xl leading-none">{r.value}</span>
                        <span className="font-mono text-[0.62rem] tracking-[0.1em] text-mute uppercase">{r.source}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <ButtonLink to={trailerSearch} target="_blank" rel="noreferrer">
                  Find the trailer ↗
                </ButtonLink>
                <ButtonLink to={`/timeline?order=${title.placement === 'official' ? 'chronological' : 'release'}#${title.id}`} variant="ghost">
                  See it on the timeline
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline placement */}
      <section className="border-t border-line bg-void-raised py-14">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-3">
          <Fact label="Phase">{phaseLabel(title.phase)}</Fact>
          <Fact label="Story order">
            {title.chronoIndex ? `#${title.chronoIndex}` : 'Not placed'}
            <span className="mt-1 block font-mono text-[0.65rem] tracking-[0.1em] text-mute uppercase">
              {title.placement === 'official'
                ? 'Official · Disney+ timeline order'
                : title.placement === 'fan'
                  ? 'Fan placement · not official'
                  : 'Not yet placed'}
            </span>
          </Fact>
          <Fact label="Note">{title.note ?? 'None'}</Fact>
        </Container>
      </section>

      {/* Characters from the archive */}
      {cast.length ? (
        <section className="border-t border-line py-16 sm:py-20">
          <Container className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 data-reveal="heading" className="font-display text-big uppercase">
                <span className="block">Files in</span>
                <span className="block text-red">this story</span>
              </h2>
              <Eyebrow className="text-mute">From the character archive</Eyebrow>
            </div>
            <ul data-reveal="stagger" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {cast.map(({ character, actor }) => (
                <li key={character.slug}>
                  <Link to={`/characters/${character.slug}`} className="group flex flex-col gap-2">
                    <CharacterArt
                      character={character}
                      decorative
                      className="aspect-[3/4] w-full grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                    />
                    <span className="font-display text-lg uppercase leading-tight group-hover:text-red-bright">{character.name}</span>
                    {actor ? <span className="text-sm text-mute">{actor}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Previous / next in release order */}
      {adjacent && (adjacent.previous || adjacent.next) ? (
        <nav aria-label="Other titles" className="grid grid-cols-2 border-t border-line">
          {adjacent.previous ? (
            <Link to={`/titles/${adjacent.previous.id}`} className="group flex flex-col gap-2 border-r border-line p-6 sm:p-10">
              <Eyebrow className="text-mute">← Released before</Eyebrow>
              <span className="font-display text-[clamp(1.2rem,3vw,2.4rem)] uppercase leading-none group-hover:text-red-bright">
                {adjacent.previous.title}
              </span>
            </Link>
          ) : (
            <span className="border-r border-line" />
          )}
          {adjacent.next ? (
            <Link to={`/titles/${adjacent.next.id}`} className="group flex flex-col items-end gap-2 p-6 text-right sm:p-10">
              <Eyebrow className="text-mute">Released after →</Eyebrow>
              <span className="font-display text-[clamp(1.2rem,3vw,2.4rem)] uppercase leading-none group-hover:text-red-bright">
                {adjacent.next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      <Container className="border-t border-line py-6">
        <Eyebrow className="text-mute">Details, poster and ratings from OMDb (CC BY-NC 4.0) · Timeline data curated for this archive</Eyebrow>
      </Container>
    </div>
  )
}

function Credit({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 sm:odd:pr-6">
      <dt>
        <Eyebrow as="span" className="text-mute">
          {label}
        </Eyebrow>
      </dt>
      <dd className="text-[0.98rem] leading-snug">{children}</dd>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Eyebrow className="text-mute">{label}</Eyebrow>
      <div className="font-display text-2xl uppercase leading-tight">{children}</div>
    </div>
  )
}

function TitleNotFound() {
  return (
    <section className="paper-grain flex min-h-[80dvh] items-end bg-paper pt-32 pb-20 text-ink">
      <Container className="flex flex-col gap-6">
        <title>Title not found | Multiverse</title>
        <h1 className="font-display text-giant uppercase">
          <span className="block">Reel</span>
          <span className="block text-red">missing</span>
        </h1>
        <p className="max-w-md text-lg">That film or series isn’t in the catalogue.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/movies" variant="ink" size="lg">
            All films
          </ButtonLink>
          <ButtonLink to="/series" variant="ghost" size="lg" className="hover:border-ink hover:bg-ink hover:text-paper">
            All series
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
