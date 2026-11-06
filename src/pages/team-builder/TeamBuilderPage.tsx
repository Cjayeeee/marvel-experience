import { lazy, Suspense, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { universeById } from '@/data/curated/universes'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { useAllCharacters } from '@/features/characters/queries'
import { libraryActions, useLibrary } from '@/features/library/useLibrary'
import { RadarChart } from '@/features/teams/RadarChart'
import { roleInfo, suggestRole } from '@/features/teams/roles'
import { fromShareParams, toShareParams, type TeamSnapshot } from '@/features/teams/shareLink'
import { cn } from '@/lib/cn'
import { averageRatings, RATINGS_NOTE } from '@/services/ratings.service'
import type { Character, CharacterCategory } from '@/types/character'
import { TEAM_ROLES, TEAM_SIZE, type TeamRole } from '@/types/library'

// The poster renderer (canvas work) loads only when someone asks for a poster.
const PosterDialog = lazy(() => import('@/features/teams/PosterDialog').then((m) => ({ default: m.PosterDialog })))

type Draft = TeamSnapshot & { id: string | null }

const EMPTY: Draft = { id: null, name: '', members: [], leader: null, roles: {} }

/**
 * /team-builder: pick up to six, choose a leader and roles, save to My
 * archive, share as a link, or make a poster.
 * ?edit=<saved team id> opens a saved team; ?m=… opens a shared one.
 */
export function TeamBuilderPage() {
  const { data: all } = useAllCharacters()
  const ready = useLibrary((s) => s.status === 'ready')

  return (
    <div className="bg-void text-bone">
      <title>Team builder | Multiverse</title>
      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">Operations · War table</Eyebrow>
            <Eyebrow className="text-ink-mute">Saved in this browser</Eyebrow>
          </div>
          <SectionHeading as="h1" size="giant" lead="Assemble" accent="Your team" />
          <p className="max-w-2xl text-lg leading-relaxed text-ink-mute">
            Pick up to six characters from any reality, choose a leader and give everyone a role. Save the squad to
            your archive, share it as a link, or print it as a poster.
          </p>
        </Container>
      </section>

      {all && ready ? (
        <Builder all={all} />
      ) : (
        <Container className="min-h-[100svh] py-24">
          <p className="text-mute">Opening the war table…</p>
        </Container>
      )}
    </div>
  )
}

const FILTERS: { value: 'all' | CharacterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hero', label: 'Heroes' },
  { value: 'antihero', label: 'Antiheroes' },
  { value: 'villain', label: 'Villains' },
]

/** The starting team: a saved one (?edit=), a shared one (?m=), or empty. */
function initialDraft(params: URLSearchParams, all: Character[]): Draft {
  const editId = params.get('edit')
  const saved = editId ? libraryActions.getTeam(editId) : undefined
  if (saved) return { id: saved.id, name: saved.name, members: saved.members, leader: saved.leader, roles: saved.roles }
  const shared = fromShareParams(params, new Set(all.map((c) => c.slug)))
  return shared ? { ...shared, id: null } : EMPTY
}

/** Mounted once the roster and library are ready; from then on the draft is its own state. */
function Builder({ all }: { all: Character[] }) {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState<Draft>(() => initialDraft(params, all))
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | CharacterCategory>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [posterOpen, setPosterOpen] = useState(false)
  const nameId = useId()
  const searchId = useId()

  const bySlug = useMemo(() => new Map(all.map((c) => [c.slug, c])), [all])
  const members = draft.members.flatMap((s) => bySlug.get(s) ?? [])
  const full = draft.members.length >= TEAM_SIZE

  const visible = all.filter((c) => {
    if (filter !== 'all' && c.category !== filter) return false
    const needle = q.trim().toLowerCase()
    return !needle || `${c.name} ${c.alias ?? ''}`.toLowerCase().includes(needle)
  })

  const update = (fn: (d: Draft) => Draft) => {
    setMessage(null)
    setDraft(fn)
  }

  const add = (slug: string) =>
    update((d) =>
      d.members.includes(slug) || d.members.length >= TEAM_SIZE
        ? d
        : { ...d, members: [...d.members, slug], leader: d.leader ?? slug, roles: { ...d.roles, [slug]: suggestRole(slug) } },
    )

  const remove = (slug: string) =>
    update((d) => {
      const rest = d.members.filter((m) => m !== slug)
      const roles = { ...d.roles }
      delete roles[slug]
      return { ...d, members: rest, roles, leader: d.leader === slug ? (rest[0] ?? null) : d.leader }
    })

  const setRole = (slug: string, role: TeamRole) => update((d) => ({ ...d, roles: { ...d.roles, [slug]: role } }))
  const setLeader = (slug: string) => update((d) => ({ ...d, leader: slug }))

  const save = (asNew = false) => {
    const saved = libraryActions.saveTeam({
      id: asNew ? undefined : (draft.id ?? undefined),
      name: draft.name,
      members: draft.members,
      leader: draft.leader,
      roles: draft.roles,
    })
    setDraft((d) => ({ ...d, id: saved.id, name: saved.name }))
    setParams({ edit: saved.id }, { replace: true, preventScrollReset: true })
    setMessage(asNew || !draft.id ? `“${saved.name}” saved to your archive.` : `“${saved.name}” updated.`)
  }

  const share = async () => {
    const url = `${window.location.origin}/team-builder?${toShareParams(draft).toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setMessage('Share link copied. Anyone who opens it sees this team.')
    } catch {
      setMessage(`Copy this link: ${url}`)
    }
  }

  const reset = () => {
    setDraft(EMPTY)
    setParams({}, { replace: true, preventScrollReset: true })
    setMessage('Started a new team.')
  }

  const avg = averageRatings(draft.members)
  const categories = members.reduce<Record<CharacterCategory, number>>(
    (acc, c) => ({ ...acc, [c.category]: acc[c.category] + 1 }),
    { hero: 0, antihero: 0, villain: 0 },
  )
  const realities = new Set(members.map((c) => c.universe))
  const rolesUsed = new Set(Object.values(draft.roles))

  return (
    <section className="py-12 sm:py-16">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* ─── Picker ─── */}
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl uppercase">Roster</h2>
            <Eyebrow className="text-mute">{full ? 'Team full' : `${TEAM_SIZE - draft.members.length} slots open`}</Eyebrow>
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor={searchId} className="sr-only">
              Search characters
            </label>
            <input
              id={searchId}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name"
              className="h-12 rounded-full border border-line bg-void-raised px-5 placeholder:text-mute focus-visible:border-bone"
            />
            <div role="group" aria-label="Filter roster" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'h-9 rounded-full border px-4 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors',
                    filter === f.value ? 'border-bone bg-bone text-ink' : 'border-line hover:border-bone',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ul
            data-lenis-prevent
            aria-label="Characters"
            className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto overscroll-contain pr-1 max-lg:max-h-[26rem] sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            {visible.map((c) => {
              const picked = draft.members.includes(c.slug)
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    aria-pressed={picked}
                    disabled={!picked && full}
                    onClick={() => (picked ? remove(c.slug) : add(c.slug))}
                    className={cn(
                      'group relative flex w-full flex-col overflow-hidden border text-left transition-[border-color,opacity] duration-300 disabled:cursor-not-allowed disabled:opacity-35',
                      picked ? 'border-red' : 'border-line hover:border-bone',
                    )}
                  >
                    <CharacterArt
                      character={c}
                      decorative
                      sizes="140px"
                      className={cn('aspect-square w-full transition-[filter] duration-500', picked ? '' : 'grayscale group-hover:grayscale-0')}
                    />
                    <span className="flex flex-col gap-0.5 bg-void-raised px-2 py-1.5">
                      <span className="truncate font-display text-[0.85rem] uppercase leading-tight">{c.name}</span>
                      <span className="truncate font-mono text-[0.55rem] tracking-[0.1em] text-mute uppercase">
                        {universeById(c.universe)?.designation}
                      </span>
                    </span>
                    {picked ? (
                      <span aria-hidden="true" className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-red text-xs text-white">
                        ✓
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
            {!visible.length ? <li className="col-span-full py-8 text-center text-mute">No one matches “{q}”.</li> : null}
          </ul>
        </div>

        {/* ─── Squad ─── */}
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className="font-mono text-[0.68rem] tracking-[0.14em] text-mute uppercase">
              Team name
            </label>
            <input
              id={nameId}
              value={draft.name}
              maxLength={60}
              onChange={(e) => {
                const name = e.target.value
                update((d) => ({ ...d, name }))
              }}
              placeholder="Untitled team"
              className="border-b-2 border-line bg-transparent pb-2 font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none placeholder:text-line focus-visible:border-red"
            />
          </div>

          <ol aria-label="Team members" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: TEAM_SIZE }, (_, i) => {
              const c = members[i]
              if (!c)
                return (
                  <li
                    key={`empty-${i}`}
                    className="flex min-h-[7.5rem] items-center justify-center border border-dashed border-line font-mono text-[0.7rem] tracking-[0.14em] text-mute uppercase"
                  >
                    Slot {i + 1} · open
                  </li>
                )
              const leader = draft.leader === c.slug
              return (
                <li
                  key={c.slug}
                  className={cn(
                    'flex gap-3 border bg-void-raised p-3 motion-safe:animate-[card-in_0.5s_var(--ease-cinematic)_both]',
                    leader ? 'border-red' : 'border-line',
                  )}
                >
                  <CharacterArt character={c} decorative sizes="80px" className="aspect-[3/4] w-20 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/characters/${c.slug}`} className="min-w-0 font-display text-lg uppercase leading-tight hover:text-red-bright">
                        {c.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(c.slug)}
                        aria-label={`Remove ${c.name}`}
                        className="-mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-mute hover:bg-line hover:text-bone"
                      >
                        ✕
                      </button>
                    </div>
                    <RoleSelect name={c.name} value={draft.roles[c.slug] ?? 'wildcard'} onChange={(r) => setRole(c.slug, r)} />
                    <button
                      type="button"
                      aria-pressed={leader}
                      aria-label={leader ? `Leader: ${c.name}` : `Make leader: ${c.name}`}
                      onClick={() => setLeader(c.slug)}
                      className={cn(
                        'mt-auto w-fit rounded-full border px-3 py-1 font-mono text-[0.62rem] tracking-[0.12em] uppercase transition-colors',
                        leader ? 'border-red bg-red text-white' : 'border-line text-mute hover:border-bone hover:text-bone',
                      )}
                    >
                      {leader ? '★ Leader' : 'Make leader'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Analysis */}
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 border-t border-line pt-8 sm:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <RadarChart ratings={avg} label={draft.name || 'This team'} />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Stat label="Heroes" value={categories.hero} />
              <Stat label="Antiheroes" value={categories.antihero} />
              <Stat label="Villains" value={categories.villain} />
              <Stat label="Realities" value={realities.size} />
              <div className="col-span-2 flex flex-col gap-2">
                <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-mute uppercase">Roles covered</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {TEAM_ROLES.map((r) => (
                    <span
                      key={r}
                      className={cn(
                        'rounded-full border px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.1em] uppercase',
                        rolesUsed.has(r) ? 'border-bone text-bone' : 'border-line text-mute line-through',
                      )}
                    >
                      {roleInfo[r].label}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 border-t border-line pt-8">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => save()} disabled={!draft.members.length}>
                {draft.id ? 'Update team' : 'Save to archive'}
              </Button>
              {draft.id ? (
                <Button variant="ghost" onClick={() => save(true)} disabled={!draft.members.length}>
                  Save as new
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => setPosterOpen(true)} disabled={!draft.members.length}>
                Make a poster
              </Button>
              <Button variant="ghost" onClick={() => void share()} disabled={!draft.members.length}>
                Copy share link
              </Button>
              <Button variant="ghost" onClick={reset} disabled={!draft.members.length && !draft.name}>
                New team
              </Button>
            </div>
            <p role="status" aria-live="polite" className="min-h-6 text-sm text-bone/85">
              {message}
              {message && draft.id && /saved|updated/.test(message) ? (
                <>
                  {' '}
                  <Link to="/me#teams" className="underline decoration-red underline-offset-4 hover:text-red-bright">
                    View in My archive
                  </Link>
                </>
              ) : null}
            </p>
            <Eyebrow className="text-mute">{RATINGS_NOTE}</Eyebrow>
          </div>
        </div>
      </Container>

      {posterOpen ? (
        <Suspense fallback={null}>
          <PosterDialog
            open={posterOpen}
            onClose={() => setPosterOpen(false)}
            team={{ name: draft.name || 'Untitled team', members, leader: draft.leader, roles: draft.roles }}
          />
        </Suspense>
      ) : null}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-mute uppercase">{label}</dt>
      <dd className="font-display text-4xl leading-none">{value}</dd>
    </div>
  )
}

function RoleSelect({ name, value, onChange }: { name: string; value: TeamRole; onChange: (r: TeamRole) => void }) {
  const id = useId()
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Role for {name}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as TeamRole)}
        title={roleInfo[value].hint}
        className="h-9 w-full appearance-none rounded-full border border-line bg-void pr-8 pl-3 font-mono text-[0.68rem] tracking-[0.1em] uppercase hover:border-bone focus-visible:border-bone"
      >
        {TEAM_ROLES.map((r) => (
          <option key={r} value={r}>
            {roleInfo[r].label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[0.6rem]">
        ▾
      </span>
    </div>
  )
}
