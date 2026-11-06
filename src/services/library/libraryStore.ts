import { createStore, type StoreApi } from 'zustand/vanilla'
import { TEAM_ROLES, TEAM_SIZE, type TeamRole, type FavouriteKind, type Library, type SavedTeam, type WatchStatus } from '@/types/library'
import type { LibraryAdapter } from './adapter'
import { LibraryStorageError } from './localAdapter'
import {
  emptyLibrary,
  LibraryImportError,
  mergeLibraries,
  parseExport,
  parseLibrary,
  toExport,
  type KnownIds,
} from './schema'

export type ImportMode = 'merge' | 'replace'

export type ImportSummary = {
  characters: number
  titles: number
  watchlist: number
  teams: number
}

export type TeamDraft = {
  /** Omit to create a new team. */
  id?: string
  name: string
  members: string[]
  leader?: string | null
  roles?: Partial<Record<string, TeamRole>>
}

export type LibraryState = {
  library: Library
  /** "loading" until the stored library has been read. */
  status: 'loading' | 'ready'
  /** Set when saving failed (e.g. storage blocked); changes still apply for this visit. */
  saveError: string | null

  /** Adds or removes a favourite. Returns true if it is now a favourite. */
  toggleFavourite: (kind: FavouriteKind, id: string) => boolean
  /** Sets a title's watchlist status, or removes it with null. */
  setWatchStatus: (titleId: string, status: WatchStatus | null) => void
  /** Creates or updates a team. Unknown or extra members are dropped. */
  saveTeam: (draft: TeamDraft) => SavedTeam
  deleteTeam: (teamId: string) => void
  /** JSON text for a download. */
  exportText: () => string
  /** Reads an exported file. Throws LibraryImportError with a readable message. */
  importText: (text: string, mode: ImportMode) => ImportSummary
  clear: () => void
}

export type LibraryStore = StoreApi<LibraryState>

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/**
 * The library store. Every change updates state immediately, then is saved
 * through the adapter. Built as a factory so tests can pass their own
 * adapter and catalogue.
 *
 * `catalogue` can be a promise so the site's main bundle doesn't have to
 * include every character and title just to validate ids. Until it arrives,
 * changes are accepted and then checked once it does.
 */
export function createLibraryStore(adapter: LibraryAdapter, catalogue: KnownIds | Promise<KnownIds>): LibraryStore {
  let known: KnownIds | null = catalogue instanceof Promise ? null : catalogue
  const isKnown = (kind: 'characters' | 'titles', id: string) => (known ? known[kind].has(id) : id.length > 0)

  // True once the visitor changes something. Until the first load finishes,
  // changes are kept in memory only (saving then would overwrite stored data
  // that hasn't been read yet); the load merges them in and saves once.
  let dirty = false

  const store = createStore<LibraryState>()((set, get) => {
    const commit = (library: Library) => {
      dirty = true
      set({ library })
      if (get().status === 'loading') return
      adapter.save(library).then(
        () => get().saveError && set({ saveError: null }),
        (error: unknown) =>
          set({ saveError: error instanceof LibraryStorageError ? error.message : 'Your changes couldn’t be saved.' }),
      )
    }
    const stamp = (library: Omit<Library, 'updatedAt'>): Library => ({ ...library, updatedAt: new Date().toISOString() })

    return {
      library: emptyLibrary(),
      status: 'loading',
      saveError: null,

      toggleFavourite(kind, id) {
        if (!isKnown(kind === 'character' ? 'characters' : 'titles', id)) return false
        const { library } = get()
        const key = kind === 'character' ? 'characters' : 'titles'
        const current = library.favourites[key]
        const on = !current.includes(id)
        commit(
          stamp({
            ...library,
            favourites: { ...library.favourites, [key]: on ? [id, ...current] : current.filter((x) => x !== id) },
          }),
        )
        return on
      },

      setWatchStatus(titleId, status) {
        if (!isKnown('titles', titleId)) return
        const { library } = get()
        const watchlist = { ...library.watchlist }
        if (status) watchlist[titleId] = { status, at: new Date().toISOString() }
        else delete watchlist[titleId]
        commit(stamp({ ...library, watchlist }))
      },

      saveTeam(draft) {
        const { library } = get()
        const now = new Date().toISOString()
        const members = [...new Set(draft.members.filter((m) => isKnown('characters', m)))].slice(0, TEAM_SIZE)
        const existing = draft.id ? library.teams.find((t) => t.id === draft.id) : undefined
        const team: SavedTeam = {
          id: existing?.id ?? newId(),
          name: draft.name.trim().slice(0, 60) || 'Untitled team',
          members,
          leader: draft.leader && members.includes(draft.leader) ? draft.leader : null,
          roles: Object.fromEntries(
            Object.entries(draft.roles ?? {}).filter(
              ([slug, role]) => members.includes(slug) && role && TEAM_ROLES.includes(role),
            ),
          ),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        }
        const teams = existing ? library.teams.map((t) => (t.id === team.id ? team : t)) : [team, ...library.teams]
        commit(stamp({ ...library, teams }))
        return team
      },

      deleteTeam(teamId) {
        const { library } = get()
        if (!library.teams.some((t) => t.id === teamId)) return
        commit(stamp({ ...library, teams: library.teams.filter((t) => t.id !== teamId) }))
      },

      exportText() {
        return JSON.stringify(toExport(get().library), null, 2)
      },

      importText(text, mode) {
        if (!known) throw new LibraryImportError('Still loading. Try again in a moment.')
        const incoming = parseExport(text, known)
        commit(mode === 'replace' ? stamp(incoming) : mergeLibraries(get().library, incoming))
        return {
          characters: incoming.favourites.characters.length,
          titles: incoming.favourites.titles.length,
          watchlist: Object.keys(incoming.watchlist).length,
          teams: incoming.teams.length,
        }
      },

      clear() {
        commit(emptyLibrary())
      },
    }
  })

  Promise.all([adapter.load(), catalogue]).then(
    ([raw, ids]) => {
      known = ids
      const stored = parseLibrary(raw, ids)
      if (!dirty) {
        store.setState({ library: stored ?? emptyLibrary(), status: 'ready' })
        return
      }
      // Changes made while loading: merge them in, drop anything unknown, save once.
      const current = store.getState().library
      const merged = parseLibrary(stored ? mergeLibraries(stored, current) : current, ids) ?? emptyLibrary()
      store.setState({ library: merged, status: 'ready' })
      adapter.save(merged).catch(() => store.setState({ saveError: 'Your changes couldn’t be saved.' }))
    },
    () => store.setState({ status: 'ready' }),
  )

  // Another tab changed the library: take its version as-is (no save, no loop).
  adapter.subscribe((raw) => {
    if (!known) return
    const library = parseLibrary(raw, known) ?? emptyLibrary()
    store.setState({ library })
  })

  return store
}
