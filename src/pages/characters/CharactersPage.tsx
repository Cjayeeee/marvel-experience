import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Sheet } from '@/components/ui/Sheet'
import { Eyebrow } from '@/components/ui/Typography'
import { teamBySlug } from '@/data/curated/teams'
import { universeById } from '@/data/curated/universes'
import { CharacterCard, CharacterCardSkeleton } from '@/features/characters/CharacterCard'
import { CharacterFilters } from '@/features/characters/CharacterFilters'
import { useCharacterFacets, useCharacterSearch } from '@/features/characters/queries'
import {
  characterSorts,
  filterLabels,
  sortLabels,
  useCharacterParams,
} from '@/features/characters/useCharacterParams'
import { cn } from '@/lib/cn'
import { useReveals } from '@/motion/useReveals'

/** /characters ("The Archive"): search, filter and browse every file. */
export function CharactersPage() {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)

  const { query, update, reset, searchText, setSearchText, activeCount } = useCharacterParams()
  const facets = useCharacterFacets()
  const search = useCharacterSearch(query)
  const [sheetOpen, setSheetOpen] = useState(false)

  const items = search.data?.pages.flatMap((p) => p.items) ?? []
  const total = search.data?.pages[0]?.total ?? 0
  const firstLoad = search.isPending
  const refreshing = search.isPlaceholderData

  // Load the next page when the sentinel scrolls into view.
  const sentinel = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = search
  useEffect(() => {
    const el = sentinel.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const chips = [
    query.q ? { key: 'q', label: `“${query.q}”`, clear: () => setSearchText('') } : null,
    query.filter && query.filter !== 'all'
      ? { key: 'filter', label: filterLabels[query.filter], clear: () => update({ filter: undefined }) }
      : null,
    query.team ? { key: 'team', label: teamBySlug(query.team)?.name ?? query.team, clear: () => update({ team: undefined }) } : null,
    query.universe
      ? { key: 'universe', label: universeById(query.universe)?.designation ?? query.universe, clear: () => update({ universe: undefined }) }
      : null,
  ].filter((c): c is { key: string; label: string; clear: () => void } => c !== null)

  const filters = <CharacterFilters query={query} facets={facets.data} onChange={update} />

  return (
    <div ref={root}>
      <title>The Archive | Multiverse</title>

      {/* Header */}
      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">Archive · Index of known individuals</Eyebrow>
            <Eyebrow className="text-ink-mute">{facets.data ? `${facets.data.total} files on record` : ' '}</Eyebrow>
          </div>
          <h1 data-reveal="heading" className="font-display text-giant uppercase">
            <span className="block">The</span>
            <span className="block text-red">Archive</span>
          </h1>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label htmlFor="archive-search">
                <Eyebrow as="span" className="text-ink-mute">
                  Search by name, alias, team, power or universe
                </Eyebrow>
              </label>
              <div className="mt-2 flex items-center gap-3 border-b-2 border-ink focus-within:border-red">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m15.5 15.5 5 5" strokeLinecap="round" />
                </svg>
                <input
                  id="archive-search"
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Try “Stark”, “X-Men” or “Earth-65”"
                  autoComplete="off"
                  className="h-16 w-full min-w-0 bg-transparent text-[clamp(1.25rem,2.4vw,1.75rem)] outline-none placeholder:text-ink-mute/60 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchText ? (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className="shrink-0 font-mono text-[0.7rem] tracking-[0.12em] uppercase underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex items-end gap-3">
              <label className="flex flex-col gap-2">
                <Eyebrow as="span" className="text-ink-mute">
                  Sort
                </Eyebrow>
                <select
                  value={query.sort ?? ''}
                  onChange={(e) => update({ sort: e.target.value || undefined })}
                  className="h-12 rounded-full border border-ink bg-transparent px-4 pr-8 font-mono text-[0.75rem] tracking-[0.1em] uppercase"
                >
                  <option value="">{query.q ? 'Best match' : sortLabels['name-asc']}</option>
                  {characterSorts
                    .filter((s) => query.q || s !== 'name-asc')
                    .map((s) => (
                      <option key={s} value={s}>
                        {sortLabels[s]}
                      </option>
                    ))}
                </select>
              </label>
              <Button
                variant="ink"
                className="lg:hidden"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
              >
                Filters{activeCount - (query.q ? 1 : 0) > 0 ? ` (${activeCount - (query.q ? 1 : 0)})` : ''}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Results */}
      <section aria-label="Results" className="bg-void pt-10 pb-24 text-bone sm:pb-32">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-24">{filters}</div>
          </aside>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4" aria-live="polite">
              <p className="mr-auto font-mono text-[0.75rem] tracking-[0.12em] uppercase">
                {firstLoad ? 'Searching the archive…' : `${total} ${total === 1 ? 'file' : 'files'}`}
                {!firstLoad && items.length < total ? <span className="text-mute"> · showing {items.length}</span> : null}
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="flex min-h-9 items-center gap-2 rounded-full border border-line px-3 font-mono text-[0.68rem] tracking-[0.1em] uppercase hover:border-red"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {chips.length > 1 ? (
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-9 font-mono text-[0.68rem] tracking-[0.1em] text-red-bright uppercase underline-offset-4 hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            {search.isError ? (
              <div role="alert" className="flex flex-col items-start gap-4 border border-red/60 p-8">
                <p className="font-display text-3xl uppercase">Signal lost</p>
                <p className="text-mute">The archive couldn’t be reached. Check your connection and try again.</p>
                <Button onClick={() => void search.refetch()}>Retry</Button>
              </div>
            ) : firstLoad ? (
              <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <CharacterCardSkeleton />
                  </li>
                ))}
              </ul>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-start gap-5 border border-dashed border-line px-6 py-14 sm:px-10">
                <Eyebrow className="text-red-bright">No match · 0 files</Eyebrow>
                <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.9]">
                  No signal from
                  <br />
                  this reality
                </p>
                <p className="max-w-md text-mute">
                  Nothing in the archive matches {query.q ? <>“{query.q}”</> : 'these filters'}
                  {chips.length > 1 ? ' with these filters' : ''}. Try a different name, or widen the search.
                </p>
                <Button variant="ghost" onClick={reset}>
                  Clear search and filters
                </Button>
              </div>
            ) : (
              <>
                <h2 className="sr-only">Results</h2>
                <ul
                  className={cn(
                    'grid grid-cols-2 gap-4 transition-opacity duration-300 sm:gap-6 md:grid-cols-3 xl:grid-cols-4',
                    refreshing && 'opacity-50',
                  )}
                >
                  {items.map((character, i) => {
                    const feature = i % 11 === 0 && !query.q
                    return (
                      <li
                        key={character.slug}
                        className={cn('animate-[card-in_0.7s_var(--ease-cinematic)_both]', feature && 'md:col-span-2 md:row-span-2')}
                        style={{ animationDelay: `${(i % 12) * 40}ms` }}
                      >
                        <CharacterCard character={character} feature={feature} />
                      </li>
                    )
                  })}
                </ul>
                <div ref={sentinel} />
                {hasNextPage ? (
                  <div className="flex justify-center pt-4">
                    <Button variant="ghost" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Opening more files…' : 'Load more files'}
                    </Button>
                  </div>
                ) : (
                  <Eyebrow className="pt-4 text-center text-mute">End of index</Eyebrow>
                )}
              </>
            )}

            <Eyebrow className="border-t border-line pt-6 text-mute">
              Curated archive · Facts compiled for this fan project · Not official Marvel data
            </Eyebrow>
          </div>
        </Container>
      </section>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={reset}>
              Clear
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {total} {total === 1 ? 'file' : 'files'}
            </Button>
          </div>
        }
      >
        {filters}
      </Sheet>
    </div>
  )
}
