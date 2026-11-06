import { describe, expect, it } from 'vitest'
import { TEAM_SIZE, type Library } from '@/types/library'
import type { LibraryAdapter } from './adapter'
import { createLibraryStore } from './libraryStore'
import { LibraryStorageError } from './localAdapter'
import { emptyLibrary, LibraryImportError, mergeLibraries, parseExport, parseLibrary, toExport } from './schema'

const known = {
  characters: new Set(['iron-man', 'thor', 'hulk', 'loki', 'storm', 'groot', 'rocket', 'vision']),
  titles: new Set(['iron-man', 'thor', 'avengers-endgame']),
}

/** In-memory adapter with a controllable first load. */
function memoryAdapter(initial: unknown = null, { failSave = false } = {}) {
  let stored = initial
  let resolveLoad: (v: unknown) => void = () => {}
  const loaded = new Promise((r) => (resolveLoad = r))
  const listeners = new Set<(raw: unknown) => void>()
  const adapter: LibraryAdapter = {
    load: () => loaded,
    save: async (library: Library) => {
      if (failSave) throw new LibraryStorageError()
      stored = JSON.parse(JSON.stringify(library))
    },
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
  return {
    adapter,
    finishLoad: () => resolveLoad(stored),
    stored: () => stored as Library | null,
    emitFromOtherTab: (raw: unknown) => listeners.forEach((fn) => fn(raw)),
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('parseLibrary', () => {
  it('rejects things that are not a library', () => {
    expect(parseLibrary(null, known)).toBeNull()
    expect(parseLibrary('hi', known)).toBeNull()
    expect(parseLibrary({ version: 1 }, known)).toBeNull()
    expect(parseLibrary({ version: 99, favourites: {} }, known)).toBeNull()
  })

  it('drops unknown ids, duplicates, bad entries and oversized teams', () => {
    const lib = parseLibrary(
      {
        version: 1,
        favourites: { characters: ['thor', 'batman', 'thor', 7], titles: ['avengers-endgame', 'dune'] },
        watchlist: { thor: { status: 'watched', at: '2026-01-01T00:00:00Z' }, dune: { status: 'want' }, 'iron-man': { status: 'maybe' } },
        teams: [
          {
            id: 'a',
            name: '  ',
            members: ['iron-man', 'thor', 'hulk', 'loki', 'storm', 'groot', 'rocket', 'superman'],
            leader: 'superman',
            roles: { thor: 'powerhouse', rocket: 'tactician', hulk: 'chef' },
          },
          { id: 'a', name: 'duplicate id', members: [] },
          { name: 'no id' },
        ],
      },
      known,
    )
    expect(lib?.favourites).toEqual({ characters: ['thor'], titles: ['avengers-endgame'] })
    expect(Object.keys(lib?.watchlist ?? {})).toEqual(['thor'])
    expect(lib?.teams).toHaveLength(1)
    expect(lib?.teams[0]?.members).toHaveLength(TEAM_SIZE)
    expect(lib?.teams[0]?.name).toBe('Untitled team')
    expect(lib?.teams[0]?.leader).toBeNull()
    // Roles survive only for members (rocket was cut at six) and known roles.
    expect(lib?.teams[0]?.roles).toEqual({ thor: 'powerhouse' })
  })
})

describe('mergeLibraries', () => {
  it('unites favourites and keeps the newer watchlist entry and team', () => {
    const a: Library = {
      ...emptyLibrary(),
      favourites: { characters: ['thor'], titles: [] },
      watchlist: { thor: { status: 'want', at: '2026-01-01T00:00:00Z' } },
      teams: [{ id: 't', name: 'Old', members: [], leader: null, roles: {}, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
    }
    const b: Library = {
      ...emptyLibrary(),
      favourites: { characters: ['hulk', 'thor'], titles: ['thor'] },
      watchlist: { thor: { status: 'watched', at: '2026-02-01T00:00:00Z' } },
      teams: [{ id: 't', name: 'New', members: [], leader: null, roles: {}, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' }],
    }
    const m = mergeLibraries(a, b)
    expect(m.favourites.characters).toEqual(['thor', 'hulk'])
    expect(m.watchlist.thor?.status).toBe('watched')
    expect(m.teams[0]?.name).toBe('New')
    // Older incoming data never overwrites newer local data.
    expect(mergeLibraries(b, a).watchlist.thor?.status).toBe('watched')
  })
})

describe('parseExport', () => {
  it('round-trips an export', () => {
    const lib = { ...emptyLibrary(), favourites: { characters: ['loki'], titles: [] } }
    expect(parseExport(JSON.stringify(toExport(lib)), known).favourites.characters).toEqual(['loki'])
  })

  it('explains bad files', () => {
    expect(() => parseExport('not json', known)).toThrow(LibraryImportError)
    expect(() => parseExport('{"app":"other"}', known)).toThrow(/wasn’t exported from Multiverse/)
    expect(() => parseExport('{"app":"marvel-multiverse","library":{"version":9,"favourites":{}}}', known)).toThrow(/newer version/)
    expect(() => parseExport('{"app":"marvel-multiverse","library":{}}', known)).toThrow(/doesn’t contain a library/)
  })
})

describe('library store', () => {
  it('loads saved data, then saves each change', async () => {
    const mem = memoryAdapter({ ...emptyLibrary(), favourites: { characters: ['thor'], titles: [] } })
    const store = createLibraryStore(mem.adapter, known)
    expect(store.getState().status).toBe('loading')
    mem.finishLoad()
    await tick()
    expect(store.getState().status).toBe('ready')
    expect(store.getState().library.favourites.characters).toEqual(['thor'])

    expect(store.getState().toggleFavourite('character', 'hulk')).toBe(true)
    expect(store.getState().toggleFavourite('character', 'thor')).toBe(false)
    expect(store.getState().toggleFavourite('character', 'batman')).toBe(false)
    store.getState().setWatchStatus('avengers-endgame', 'want')
    await tick()
    expect(mem.stored()?.favourites.characters).toEqual(['hulk'])
    expect(mem.stored()?.watchlist['avengers-endgame']?.status).toBe('want')

    store.getState().setWatchStatus('avengers-endgame', null)
    await tick()
    expect(mem.stored()?.watchlist).toEqual({})
  })

  it('keeps a change made before the first load finishes', async () => {
    const mem = memoryAdapter({ ...emptyLibrary(), favourites: { characters: ['thor'], titles: [] } })
    const store = createLibraryStore(mem.adapter, known)
    store.getState().toggleFavourite('character', 'hulk')
    await tick()
    // Nothing is written before the stored library has been read.
    expect(mem.stored()?.favourites.characters).toEqual(['thor'])
    mem.finishLoad()
    await tick()
    expect(store.getState().library.favourites.characters.sort()).toEqual(['hulk', 'thor'])
    expect(mem.stored()?.favourites.characters.sort()).toEqual(['hulk', 'thor'])
  })

  it('accepts changes before a slow catalogue arrives, then drops unknown ids', async () => {
    const mem = memoryAdapter()
    let deliver: (ids: typeof known) => void = () => {}
    const catalogue = new Promise<typeof known>((r) => (deliver = r))
    const store = createLibraryStore(mem.adapter, catalogue)
    store.getState().toggleFavourite('character', 'thor')
    store.getState().toggleFavourite('character', 'batman')
    mem.finishLoad()
    await tick()
    expect(store.getState().status).toBe('loading')
    deliver(known)
    await tick()
    expect(store.getState().status).toBe('ready')
    expect(store.getState().library.favourites.characters).toEqual(['thor'])
    expect(mem.stored()?.favourites.characters).toEqual(['thor'])
  })

  it('creates, updates and deletes teams', async () => {
    const mem = memoryAdapter()
    const store = createLibraryStore(mem.adapter, known)
    mem.finishLoad()
    await tick()
    const team = store.getState().saveTeam({
      name: 'Asgard',
      members: ['thor', 'loki', 'thor', 'batman'],
      leader: 'loki',
      roles: { thor: 'powerhouse', loki: 'tactician', batman: 'brawler' },
    })
    expect(team.members).toEqual(['thor', 'loki'])
    expect(team.roles).toEqual({ thor: 'powerhouse', loki: 'tactician' })
    expect(team.leader).toBe('loki')
    const updated = store.getState().saveTeam({ id: team.id, name: 'Asgard II', members: ['thor'], leader: 'loki', roles: team.roles })
    expect(updated.createdAt).toBe(team.createdAt)
    expect(updated.roles).toEqual({ thor: 'powerhouse' })
    expect(updated.leader).toBeNull()
    expect(store.getState().library.teams).toHaveLength(1)
    store.getState().deleteTeam(team.id)
    expect(store.getState().library.teams).toHaveLength(0)
  })

  it('imports by merging or replacing', async () => {
    const mem = memoryAdapter({ ...emptyLibrary(), favourites: { characters: ['thor'], titles: [] } })
    const store = createLibraryStore(mem.adapter, known)
    mem.finishLoad()
    await tick()
    const file = JSON.stringify(toExport({ ...emptyLibrary(), favourites: { characters: ['storm', 'batman'], titles: ['thor'] } }))
    expect(store.getState().importText(file, 'merge')).toEqual({ characters: 1, titles: 1, watchlist: 0, teams: 0 })
    expect(store.getState().library.favourites.characters).toEqual(['thor', 'storm'])
    store.getState().importText(file, 'replace')
    expect(store.getState().library.favourites.characters).toEqual(['storm'])
  })

  it('follows changes from another tab', async () => {
    const mem = memoryAdapter()
    const store = createLibraryStore(mem.adapter, known)
    mem.finishLoad()
    await tick()
    mem.emitFromOtherTab({ ...emptyLibrary(), favourites: { characters: ['vision'], titles: [] } })
    expect(store.getState().library.favourites.characters).toEqual(['vision'])
    mem.emitFromOtherTab(null)
    expect(store.getState().library.favourites.characters).toEqual([])
  })

  it('reports blocked storage but keeps working for the visit', async () => {
    const mem = memoryAdapter(null, { failSave: true })
    const store = createLibraryStore(mem.adapter, known)
    mem.finishLoad()
    await tick()
    store.getState().toggleFavourite('character', 'groot')
    await tick()
    expect(store.getState().saveError).toMatch(/isn’t letting the site save/)
    expect(store.getState().library.favourites.characters).toEqual(['groot'])
  })
})
