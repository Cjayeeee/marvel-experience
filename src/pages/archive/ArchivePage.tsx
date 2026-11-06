import { useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { CharacterCard } from '@/features/characters/CharacterCard'
import { useCharactersBySlugs } from '@/features/characters/queries'
import { WatchControl } from '@/features/library/WatchControl'
import { roleInfo } from '@/features/teams/roles'
import { libraryActions, useLibrary } from '@/features/library/useLibrary'
import { TitleCard } from '@/features/titles/TitleCard'
import { TitlePoster } from '@/features/titles/TitlePoster'
import { useTitlesByIds } from '@/features/titles/queries'
import { cn } from '@/lib/cn'
import { useReveals } from '@/motion/useReveals'
import { LibraryImportError, previewImport, type ImportMode, type ImportSummary } from '@/services/library'
import { phaseLabel } from '@/services/titles.service'
import type { SavedTeam } from '@/types/library'
import type { Title } from '@/types/title'

/** /me: favourites, watchlist and saved teams, kept in this browser. */
export function ArchivePage() {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)

  const library = useLibrary((s) => s.library)
  const ready = useLibrary((s) => s.status === 'ready')
  const saveError = useLibrary((s) => s.saveError)

  const favCharacters = useCharactersBySlugs(library.favourites.characters)
  const favTitles = useTitlesByIds(library.favourites.titles)
  const watchEntries = Object.entries(library.watchlist).sort(([, a], [, b]) => Date.parse(b.at) - Date.parse(a.at))
  const watchTitles = useTitlesByIds(watchEntries.map(([id]) => id))
  const want = (watchTitles.data ?? []).filter((t) => library.watchlist[t.id]?.status === 'want')
  const watched = (watchTitles.data ?? []).filter((t) => library.watchlist[t.id]?.status === 'watched')

  const counts = {
    characters: library.favourites.characters.length,
    titles: library.favourites.titles.length,
    watchlist: watchEntries.length,
    teams: library.teams.length,
  }
  const total = counts.characters + counts.titles + counts.watchlist + counts.teams

  return (
    <div ref={root} className="bg-void text-bone">
      <title>My archive | Multiverse</title>

      {/* ─── Cover ─── */}
      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">Personal file · Kept in this browser</Eyebrow>
            <Eyebrow className="text-ink-mute">No account needed</Eyebrow>
          </div>
          <SectionHeading as="h1" size="giant" lead="My" accent="Archive" />

          <nav aria-label="Archive sections">
            <ul className="grid grid-cols-2 border-t border-ink/25 sm:grid-cols-4">
              {(
                [
                  ['characters', 'Characters', counts.characters],
                  ['titles', 'Films & series', counts.titles],
                  ['watchlist', 'Watchlist', counts.watchlist],
                  ['teams', 'Teams', counts.teams],
                ] as const
              ).map(([id, label, n]) => (
                <li key={id} className="border-b border-ink/25 sm:border-r sm:last:border-r-0">
                  <a href={`#${id}`} className="group flex flex-col gap-1 py-4 pr-4 transition-colors hover:text-red">
                    <span className="font-display text-5xl leading-none">{ready ? n : '–'}</span>
                    <Eyebrow className="text-ink-mute group-hover:text-red">{label}</Eyebrow>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {saveError ? (
            <p role="alert" className="border border-red px-4 py-3 text-sm text-red">
              {saveError}
            </p>
          ) : null}
        </Container>
      </section>

      {!ready ? <div aria-hidden="true" className="min-h-[100svh]" /> : null}
      {ready && total === 0 ? <EmptyArchive /> : null}

      {ready && total > 0 ? (
        <>
          <ArchiveSection id="characters" lead="Favourite" accent="Characters" count={counts.characters}>
            {counts.characters ? (
              <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {(favCharacters.data ?? []).map((c) => (
                  <li key={c.slug}>
                    <CharacterCard character={c} />
                  </li>
                ))}
              </ul>
            ) : (
              <Hint>
                Tap the star on any <Link to="/characters">character</Link> to keep them here.
              </Hint>
            )}
          </ArchiveSection>

          <ArchiveSection id="titles" lead="Favourite" accent="Films & series" count={counts.titles}>
            {counts.titles ? (
              <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {(favTitles.data ?? []).map((t) => (
                  <li key={t.id}>
                    <TitleCard title={t} />
                  </li>
                ))}
              </ul>
            ) : (
              <Hint>
                Star a <Link to="/movies">film</Link> or <Link to="/series">series</Link> to keep it here.
              </Hint>
            )}
          </ArchiveSection>

          <ArchiveSection id="watchlist" lead="The" accent="Watchlist" count={counts.watchlist}>
            {counts.watchlist ? (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-2 lg:gap-10">
                <WatchGroup heading="To watch" titles={want} empty="Nothing queued. Add titles with “Want to watch”." />
                <WatchGroup
                  heading="Watched"
                  titles={watched}
                  empty="Nothing ticked off yet. Mark titles as watched, or tap the numbers on the timeline."
                />
              </div>
            ) : (
              <Hint>
                Mark titles as “Want to watch” or “Watched” on their pages, or tick them off on the{' '}
                <Link to="/timeline">timeline</Link>.
              </Hint>
            )}
          </ArchiveSection>

          <ArchiveSection id="teams" lead="Saved" accent="Teams" count={counts.teams}>
            {counts.teams ? (
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
                {library.teams.map((team) => (
                  <li key={team.id}>
                    <TeamCard team={team} />
                  </li>
                ))}
              </ul>
            ) : (
              <Hint>
                Teams you save in the <Link to="/team-builder">team builder</Link> appear here.
              </Hint>
            )}
          </ArchiveSection>
        </>
      ) : null}

      {ready ? <BackupSection total={total} /> : null}
    </div>
  )
}

function ArchiveSection({
  id,
  lead,
  accent,
  count,
  children,
}: {
  id: string
  lead: string
  accent: string
  count: number
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-t border-line py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id={`${id}-heading`} lead={lead} accent={accent} size="big" />
          <Eyebrow className="text-mute">{count === 1 ? '1 entry' : `${count} entries`}</Eyebrow>
        </div>
        {children}
      </Container>
    </section>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-xl border border-dashed border-line px-5 py-6 text-mute [&_a]:text-bone [&_a]:underline [&_a]:decoration-red [&_a]:underline-offset-4 [&_a:hover]:text-red-bright">
      {children}
    </p>
  )
}

function EmptyArchive() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex max-w-3xl flex-col gap-6">
        <p className="font-display text-huge uppercase leading-[0.9]">
          Nothing on file <span className="text-red">yet</span>
        </p>
        <p className="max-w-xl text-lg leading-relaxed text-bone/80">
          Star characters and titles, build a watchlist, or tick films off on the timeline. Everything stays in this
          browser, so there’s nothing to sign up for. Coming from another device? Import a backup below.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/characters">Browse characters</ButtonLink>
          <ButtonLink to="/timeline" variant="ghost">
            Open the timeline
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}

function WatchGroup({ heading, titles, empty }: { heading: string; titles: Title[]; empty: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="font-display text-2xl uppercase">{heading}</span>
        <Eyebrow as="span" className="text-mute">
          {titles.length}
        </Eyebrow>
      </h3>
      {titles.length ? (
        <ul className="flex flex-col gap-3">
          {titles.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-4 border border-line bg-void-raised p-3">
              <Link to={`/titles/${t.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                <TitlePoster title={t} className="aspect-[2/3] w-12 shrink-0" />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg uppercase leading-tight group-hover:text-red-bright">{t.title}</span>
                  <span className="font-mono text-[0.62rem] tracking-[0.12em] text-mute uppercase">
                    {t.kind === 'film' ? 'Film' : 'Series'} · {t.releaseDate.slice(0, 4)} · {phaseLabel(t.phase)}
                  </span>
                </span>
              </Link>
              <WatchControl title={t} className="max-sm:w-full max-sm:justify-center" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-mute">{empty}</p>
      )}
    </div>
  )
}

function TeamCard({ team }: { team: SavedTeam }) {
  const members = useCharactersBySlugs(team.members)
  const leader = members.data?.find((c) => c.slug === team.leader)
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="flex h-full flex-col gap-5 border border-line bg-void-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-display text-2xl uppercase leading-tight [overflow-wrap:anywhere]">{team.name}</h3>
          <Eyebrow className="text-mute">
            {team.members.length} of 6{leader ? ` · Led by ${leader.name}` : ''}
          </Eyebrow>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2">
        {(members.data ?? []).map((c) => (
          <li key={c.slug}>
            <Link
              to={`/characters/${c.slug}`}
              title={`${c.name}${team.roles[c.slug] ? ` · ${roleInfo[team.roles[c.slug]!].label}` : ''}`}
              className="block"
            >
              <CharacterArt
                character={c}
                sizes="48px"
                className={cn('size-12 rounded-full border-2', c.slug === team.leader ? 'border-red' : 'border-line')}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-4 font-mono text-[0.72rem] tracking-[0.12em] uppercase">
        {confirming ? (
          <>
            <span className="text-mute">Delete this team?</span>
            <button type="button" onClick={() => libraryActions.deleteTeam(team.id)} className="text-red-bright hover:underline">
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="hover:underline">
              Keep
            </button>
          </>
        ) : (
          <>
            <Link to={`/team-builder?edit=${team.id}`} className="text-bone hover:text-red-bright">
              Edit
            </Link>
            <button type="button" onClick={() => setConfirming(true)} className="text-mute hover:text-red-bright">
              Delete team
            </button>
          </>
        )}
      </div>
    </article>
  )
}

type PendingImport = { text: string; fileName: string; summary: ImportSummary }

const describe = (s: ImportSummary) =>
  [
    [s.characters, 'character', 'characters'],
    [s.titles, 'title', 'titles'],
    [s.watchlist, 'watchlist entry', 'watchlist entries'],
    [s.teams, 'team', 'teams'],
  ]
    .filter(([n]) => Number(n) > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`)
    .join(', ') || 'nothing'

function BackupSection({ total }: { total: number }) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const download = () => {
    const blob = new Blob([libraryActions.exportText()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multiverse-archive-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: 'Backup downloaded.' })
  }

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setMessage(null)
    if (file.size > 2_000_000) {
      setMessage({ tone: 'error', text: 'That file is too large to be a Multiverse backup.' })
      return
    }
    try {
      const text = await file.text()
      setPending({ text, fileName: file.name, summary: await previewImport(text) })
    } catch (error) {
      setPending(null)
      setMessage({ tone: 'error', text: error instanceof LibraryImportError ? error.message : 'That file couldn’t be read.' })
    }
  }

  const apply = (mode: ImportMode) => {
    if (!pending) return
    try {
      const summary = libraryActions.importText(pending.text, mode)
      setMessage({ tone: 'ok', text: `${mode === 'merge' ? 'Merged' : 'Replaced with'} ${describe(summary)}.` })
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof LibraryImportError ? error.message : 'Import failed.' })
    }
    setPending(null)
  }

  return (
    <section aria-labelledby="backup-heading" className="paper-grain bg-paper py-16 text-ink sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <SectionHeading id="backup-heading" lead="Backup" accent="& move" size="big" />
          <p className="max-w-2xl leading-relaxed text-ink-mute">
            Your archive lives only in this browser. Clearing site data removes it. Download a backup now and then,
            and import it here or on another device to carry everything across.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="ink" onClick={download} disabled={total === 0}>
            Download backup
          </Button>
          <input
            ref={input}
            id={inputId}
            type="file"
            accept="application/json,.json"
            onChange={choose}
            aria-label="Backup file to import"
            tabIndex={-1}
            className="sr-only"
          />
          <Button
            variant="ghost"
            onClick={() => input.current?.click()}
            className="hover:border-ink hover:bg-ink hover:text-paper"
          >
            Import a backup
          </Button>
        </div>

        {pending ? (
          <div role="group" aria-label="Import options" className="flex flex-col gap-4 border-2 border-ink p-5">
            <p>
              <strong className="font-semibold">{pending.fileName}</strong> contains {describe(pending.summary)}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="ink" onClick={() => apply('merge')}>
                Merge with mine
              </Button>
              <Button
                variant="ghost"
                onClick={() => apply('replace')}
                className="border-red text-red hover:border-red hover:bg-red hover:text-white"
              >
                Replace mine
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)} className="hover:border-ink hover:bg-ink hover:text-paper">
                Cancel
              </Button>
            </div>
            <p className="text-sm text-ink-mute">
              Merge keeps everything from both. Where the same entry differs, the newer one wins. Replace swaps your
              current archive for the file’s.
            </p>
          </div>
        ) : null}

        <p role="status" aria-live="polite" className={cn('text-sm', message?.tone === 'error' ? 'text-red' : 'text-ink')}>
          {message?.text}
        </p>

        {total > 0 ? (
          <div className="flex flex-wrap items-center gap-4 border-t border-ink/20 pt-6 font-mono text-[0.75rem] tracking-[0.12em] uppercase">
            {confirmClear ? (
              <>
                <span>Remove all {total} entries from this browser?</span>
                <button
                  type="button"
                  onClick={() => {
                    libraryActions.clear()
                    setConfirmClear(false)
                    setMessage({ tone: 'ok', text: 'Archive cleared.' })
                  }}
                  className="text-red underline-offset-4 hover:underline"
                >
                  Yes, clear everything
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="underline-offset-4 hover:underline">
                  Keep it
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="text-ink-mute hover:text-red">
                Clear my archive
              </button>
            )}
          </div>
        ) : null}
      </Container>
    </section>
  )
}
