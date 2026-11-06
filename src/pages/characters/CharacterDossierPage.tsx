import { useRef, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { teamBySlug } from '@/data/curated/teams'
import { universeById } from '@/data/curated/universes'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { categoryStyles } from '@/features/characters/categoryStyles'
import { CharacterCard } from '@/features/characters/CharacterCard'
import { useAdjacentCharacters, useCharacter, useRelatedCharacters } from '@/features/characters/queries'
import { Redacted } from '@/features/characters/Redacted'
import { cn } from '@/lib/cn'
import { useReveals } from '@/motion/useReveals'
import { fileNumber } from '@/services/characters.service'
import { findTitleId } from '@/services/titles.service'
import type { Character } from '@/types/character'

/** /characters/:slug — a classified S.H.I.E.L.D.-style dossier. */
export function CharacterDossierPage() {
  const { slug = '' } = useParams()
  const { data: character, isPending, isError, refetch } = useCharacter(slug)

  if (isPending) return <DossierSkeleton />
  if (isError) {
    return (
      <Shell>
        <Eyebrow className="text-ink-mute">Transmission error</Eyebrow>
        <p className="font-display text-giant uppercase">Signal lost</p>
        <button type="button" onClick={() => void refetch()} className="w-fit font-mono text-sm uppercase underline">
          Retry
        </button>
      </Shell>
    )
  }
  if (!character) return <FileNotFound slug={slug} />
  return <Dossier key={character.slug} character={character} />
}

function Dossier({ character }: { character: Character }) {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)

  const universe = universeById(character.universe)
  const category = categoryStyles[character.category]
  const { data: connections } = useRelatedCharacters(character)
  const { data: adjacent } = useAdjacentCharacters(character.slug)
  const fileNo = fileNumber(character.slug)

  return (
    <div ref={root}>
      <title>{`${character.name}${character.alias ? ` (${character.alias})` : ''} — Multiverse`}</title>

      {/* ─── Cover sheet ─── */}
      <section className="paper-grain overflow-hidden bg-paper pt-24 pb-16 text-ink sm:pt-32 sm:pb-24">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 pb-4">
            <Link
              to="/characters"
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase underline-offset-4 hover:underline"
            >
              ← Back to the archive
            </Link>
            <Eyebrow className="text-ink-mute">
              File {fileNo} · {universe?.designation} · Clearance 7
            </Eyebrow>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-[0.7rem] tracking-[0.12em] uppercase',
                    character.category === 'villain' ? 'border-red bg-red text-white' : 'border-ink',
                  )}
                >
                  {category.label}
                </span>
                {character.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-ink px-3 py-1 font-mono text-[0.7rem] tracking-[0.12em] text-paper uppercase">
                    {tag === 'variant' ? 'Variant' : 'Cosmic'}
                  </span>
                ))}
              </div>
              <h1 data-reveal="heading" className="font-display text-giant uppercase [overflow-wrap:anywhere]">
                {character.name}
              </h1>
              {character.alias ? (
                <p className="font-mono text-[clamp(0.85rem,1.5vw,1.05rem)] tracking-[0.18em] uppercase">
                  Real name: {character.alias}
                </p>
              ) : null}

              {/* Key facts */}
              <dl data-reveal="stagger" className="mt-4 grid grid-cols-1 border-t border-ink/25 sm:grid-cols-2">
                <Fact label="Universe">
                  {universe ? (
                    <>
                      {universe.designation}
                      <span className="block text-sm text-ink-mute normal-case">{universe.name}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </Fact>
                <Fact label={character.firstAppearance.medium === 'screen' ? 'Debut (screen)' : 'First appearance'}>
                  {character.firstAppearance.title}
                  <span className="block text-sm text-ink-mute">{character.firstAppearance.year}</span>
                </Fact>
                <Fact label="Affiliations">
                  {character.teams.length ? (
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                      {character.teams.map((t) => (
                        <Link key={t} to={`/characters?team=${t}`} className="underline decoration-red decoration-2 underline-offset-4 hover:text-red">
                          {teamBySlug(t)?.name ?? t}
                        </Link>
                      ))}
                    </span>
                  ) : (
                    'Unaffiliated'
                  )}
                </Fact>
                <Fact label="Classification">
                  {category.label}
                  {character.tags.length ? (
                    <span className="block text-sm text-ink-mute">
                      {character.tags.map((t) => (t === 'variant' ? 'Alternate-universe variant' : 'Cosmic-level')).join(' · ')}
                    </span>
                  ) : null}
                </Fact>
              </dl>
            </div>

            {/* Portrait with stamp */}
            <div data-reveal="up" className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="relative rotate-[1.5deg] bg-white p-3 pb-12 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)]">
                <CharacterArt character={character} priority className="aspect-[3/4] w-full" />
                <p className="absolute right-4 bottom-3 left-4 font-mono text-[0.68rem] tracking-[0.14em] text-ink-mute uppercase">
                  Subject · {character.name}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="absolute -top-4 -left-4 -rotate-12 border-[3px] border-red px-3 py-1 font-display text-2xl tracking-[0.06em] text-red uppercase mix-blend-multiply"
              >
                Classified
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Biography & origin (declassified on scroll) ─── */}
      <section className="paper-grain border-t border-ink/15 bg-paper-dim py-20 text-ink sm:py-28">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-2 lg:gap-20">
          <article className="flex flex-col gap-5">
            <Eyebrow className="text-ink-mute">Section 01 · Biography</Eyebrow>
            <Redacted className="text-[clamp(1.2rem,2vw,1.6rem)] leading-snug">{character.bio}</Redacted>
          </article>
          <article className="flex flex-col gap-5">
            <Eyebrow className="text-ink-mute">Section 02 · Origin</Eyebrow>
            <Redacted className="text-[clamp(1.2rem,2vw,1.6rem)] leading-snug">{character.origin}</Redacted>
          </article>
        </Container>
      </section>

      {/* ─── Powers ─── */}
      <section className="bg-void py-20 text-bone sm:py-28">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow className="text-mute">Section 03</Eyebrow>
            <SectionHeading lead="Powers &" accent="Abilities" />
          </div>
          <ol data-reveal="stagger" className="flex flex-col border-t border-line">
            {character.powers.map((power, i) => (
              <li key={power} className="flex items-baseline gap-5 border-b border-line py-4">
                <span className="w-8 font-mono text-[0.72rem] text-red-bright">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[clamp(1.5rem,3vw,2.4rem)] uppercase leading-none">{power}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── Screen appearances ─── */}
      {character.screen.length ? (
        <section className="overflow-hidden bg-void pb-20 text-bone sm:pb-28">
          <Container className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-4">
              <Eyebrow className="text-mute">Section 04</Eyebrow>
              <SectionHeading lead="On screen" accent="Notable appearances" size="big" />
            </div>
            <Eyebrow className="text-mute">Selected titles · Not a full filmography</Eyebrow>
          </Container>
          <div className="bg-paper-dim text-ink">
            <div aria-hidden="true" className="sprockets h-4" />
            <ul data-reveal="stagger" className="flex gap-1.5 overflow-x-auto px-5 py-1.5 [scrollbar-width:thin] sm:px-8 lg:px-12">
              {character.screen.map((s) => (
                <li key={`${s.title}-${s.year}`} className="w-[17rem] shrink-0">
                  <ScreenCard appearance={s} />
                </li>
              ))}
            </ul>
            <div aria-hidden="true" className="sprockets h-4" />
          </div>
        </section>
      ) : null}

      {/* ─── Connections ─── */}
      {connections && (connections.related.length || connections.teammates.length) ? (
        <section className="border-t border-line bg-void py-20 text-bone sm:py-28">
          <Container className="flex flex-col gap-16">
            {connections.related.length ? (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Eyebrow className="text-mute">Section 05 · Cross-referenced files</Eyebrow>
                  <SectionHeading lead="Connected" accent="Files" size="big" />
                </div>
                <ul data-reveal="stagger" className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-5">
                  {connections.related.map((c) => (
                    <li key={c.slug}>
                      <CharacterCard character={c} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {connections.teammates.length ? (
              <div className="flex flex-col gap-6">
                <Eyebrow className="text-mute">Also on the roster</Eyebrow>
                <ul className="flex flex-wrap gap-2">
                  {connections.teammates.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/characters/${c.slug}`}
                        className="flex min-h-10 items-center rounded-full border border-line px-4 font-display text-lg uppercase transition-colors hover:border-red hover:text-red-bright"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {/* ─── Previous / next file ─── */}
      {adjacent?.previous && adjacent.next ? (
        <nav aria-label="Other files" className="grid grid-cols-2 border-t border-line bg-void text-bone">
          <Link to={`/characters/${adjacent.previous.slug}`} className="group flex flex-col gap-2 border-r border-line p-6 sm:p-10">
            <Eyebrow className="text-mute">← Previous file</Eyebrow>
            <span className="font-display text-[clamp(1.4rem,3.5vw,2.75rem)] uppercase leading-none transition-colors group-hover:text-red-bright">
              {adjacent.previous.name}
            </span>
          </Link>
          <Link to={`/characters/${adjacent.next.slug}`} className="group flex flex-col items-end gap-2 p-6 text-right sm:p-10">
            <Eyebrow className="text-mute">Next file →</Eyebrow>
            <span className="font-display text-[clamp(1.4rem,3.5vw,2.75rem)] uppercase leading-none transition-colors group-hover:text-red-bright">
              {adjacent.next.name}
            </span>
          </Link>
        </nav>
      ) : null}

      <div className="bg-void pb-6">
        <Container>
          <Eyebrow className="border-t border-line pt-6 text-mute">
            Curated file · Biography written for this fan archive · Not official Marvel data
          </Eyebrow>
        </Container>
      </div>
    </div>
  )
}

function ScreenCard({ appearance: s }: { appearance: Character['screen'][number] }) {
  const titleId = findTitleId(s.title)
  const body = (
    <>
      <div className="flex items-center justify-between">
        <Eyebrow className="text-mute">{s.kind === 'film' ? 'Film' : 'Series'}</Eyebrow>
        <Eyebrow className="text-red-bright">{s.year}</Eyebrow>
      </div>
      <p className="font-display text-2xl uppercase leading-[0.95]">{s.title}</p>
      <p className="border-t border-line pt-3 text-sm text-mute">{s.actor ?? 'Performer not listed'}</p>
    </>
  )
  const className = 'flex h-full flex-col justify-between gap-8 bg-void p-5 text-bone'
  return titleId ? (
    <Link to={`/titles/${titleId}`} className={`${className} transition-colors hover:bg-void-card [&_p:first-of-type]:hover:text-red-bright`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink/25 py-4 sm:odd:pr-6">
      <dt>
        <Eyebrow as="span" className="text-ink-mute">
          {label}
        </Eyebrow>
      </dt>
      <dd className="font-display text-xl uppercase leading-tight">{children}</dd>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="paper-grain flex min-h-[80dvh] items-end bg-paper pt-32 pb-20 text-ink">
      <Container className="flex flex-col gap-6">{children}</Container>
    </section>
  )
}

function FileNotFound({ slug }: { slug: string }) {
  return (
    <Shell>
      <title>File not found — Multiverse</title>
      <Eyebrow className="text-ink-mute">Archive search · “{slug}”</Eyebrow>
      <h1 className="font-display text-giant uppercase">
        <span className="block">File</span>
        <span className="block text-red">not found</span>
      </h1>
      <p className="max-w-md text-lg">There’s no record by that name. It may be filed under a different alias.</p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink to={`/characters?q=${encodeURIComponent(slug.replace(/-/g, ' '))}`} variant="ink" size="lg">
          Search the archive
        </ButtonLink>
        <ButtonLink to="/characters" variant="ghost" size="lg" className="hover:border-ink hover:bg-ink hover:text-paper">
          Browse all files
        </ButtonLink>
      </div>
    </Shell>
  )
}

function DossierSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading file" className="paper-grain min-h-[90dvh] bg-paper pt-32 text-ink">
      <Container className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col gap-6">
          <div className="h-3 w-40 animate-pulse bg-paper-line" />
          <div className="h-28 w-4/5 animate-pulse bg-paper-line" />
          <div className="h-4 w-56 animate-pulse bg-paper-line" />
        </div>
        <div className="aspect-[3/4] animate-pulse bg-paper-line" />
      </Container>
    </section>
  )
}
