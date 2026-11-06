import {
  LIBRARY_VERSION,
  TEAM_SIZE,
  type Library,
  type LibraryExport,
  TEAM_ROLES,
  type SavedTeam,
  type TeamRole,
  type WatchEntry,
} from '@/types/library'

/**
 * Pure functions for the library: creating, validating, merging and
 * exporting. No storage here, so they're easy to test and reuse with any
 * adapter (browser storage now, a database later).
 */

/** Ids the library may refer to. Anything else is dropped on load and import. */
export type KnownIds = {
  characters: ReadonlySet<string>
  titles: ReadonlySet<string>
}

export function emptyLibrary(now = new Date().toISOString()): Library {
  return { version: LIBRARY_VERSION, favourites: { characters: [], titles: [] }, watchlist: {}, teams: [], updatedAt: now }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isIso = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v))

/** Unique strings from `value` that are in `known`, keeping the first occurrence's order. */
function knownList(value: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && known.has(v)))]
}

function parseTeam(value: unknown, known: KnownIds, fallbackTime: string): SavedTeam | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return null
  const members = knownList(value.members, known.characters).slice(0, TEAM_SIZE)
  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim().slice(0, 60) : 'Untitled team'
  const leader = typeof value.leader === 'string' && members.includes(value.leader) ? value.leader : null
  const roles: Partial<Record<string, TeamRole>> = {}
  if (isRecord(value.roles)) {
    for (const [slug, role] of Object.entries(value.roles)) {
      if (members.includes(slug) && TEAM_ROLES.includes(role as TeamRole)) roles[slug] = role as TeamRole
    }
  }
  return {
    id: value.id.slice(0, 64),
    name,
    members,
    leader,
    roles,
    createdAt: isIso(value.createdAt) ? value.createdAt : fallbackTime,
    updatedAt: isIso(value.updatedAt) ? value.updatedAt : fallbackTime,
  }
}

/**
 * Turn anything (stored JSON, an imported file) into a valid Library.
 * Unknown ids, bad entries and wrong types are dropped rather than failing,
 * so an old or hand-edited file still loads what it can.
 * Returns null only when the input isn't a library at all.
 */
export function parseLibrary(value: unknown, known: KnownIds): Library | null {
  if (!isRecord(value) || !isRecord(value.favourites)) return null
  // Future versions migrate here, e.g. `if (value.version === 1) value = migrateV1toV2(value)`.
  if (typeof value.version !== 'number' || value.version > LIBRARY_VERSION) return null

  const now = new Date().toISOString()
  const watchlist: Record<string, WatchEntry> = {}
  if (isRecord(value.watchlist)) {
    for (const [id, entry] of Object.entries(value.watchlist)) {
      if (!known.titles.has(id) || !isRecord(entry)) continue
      if (entry.status !== 'want' && entry.status !== 'watched') continue
      watchlist[id] = { status: entry.status, at: isIso(entry.at) ? entry.at : now }
    }
  }

  const teams: SavedTeam[] = []
  const seenTeams = new Set<string>()
  for (const raw of Array.isArray(value.teams) ? value.teams : []) {
    const team = parseTeam(raw, known, now)
    if (team && !seenTeams.has(team.id)) {
      seenTeams.add(team.id)
      teams.push(team)
    }
  }

  return {
    version: LIBRARY_VERSION,
    favourites: {
      characters: knownList(value.favourites.characters, known.characters),
      titles: knownList(value.favourites.titles, known.titles),
    },
    watchlist,
    teams,
    updatedAt: isIso(value.updatedAt) ? value.updatedAt : now,
  }
}

/**
 * Combine two libraries without losing anything: favourites are united
 * (`base` order first), and for the same title or team id the most recently
 * updated entry wins.
 */
export function mergeLibraries(base: Library, incoming: Library, now = new Date().toISOString()): Library {
  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]

  const watchlist = { ...base.watchlist }
  for (const [id, entry] of Object.entries(incoming.watchlist)) {
    const current = watchlist[id]
    if (!current || Date.parse(entry.at) > Date.parse(current.at)) watchlist[id] = entry
  }

  const teams = new Map(base.teams.map((t) => [t.id, t]))
  for (const team of incoming.teams) {
    const current = teams.get(team.id)
    if (!current || Date.parse(team.updatedAt) > Date.parse(current.updatedAt)) teams.set(team.id, team)
  }

  return {
    version: LIBRARY_VERSION,
    favourites: {
      characters: union(base.favourites.characters, incoming.favourites.characters),
      titles: union(base.favourites.titles, incoming.favourites.titles),
    },
    watchlist,
    teams: [...teams.values()],
    updatedAt: now,
  }
}

export function toExport(library: Library, now = new Date().toISOString()): LibraryExport {
  return { app: 'marvel-multiverse', exportedAt: now, library }
}

export class LibraryImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibraryImportError'
  }
}

/** Read the text of an exported file. Throws LibraryImportError with a readable message. */
export function parseExport(text: string, known: KnownIds): Library {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new LibraryImportError('That file isn’t valid JSON.')
  }
  if (!isRecord(data) || data.app !== 'marvel-multiverse') {
    throw new LibraryImportError('That file wasn’t exported from Multiverse.')
  }
  if (isRecord(data.library) && typeof data.library.version === 'number' && data.library.version > LIBRARY_VERSION) {
    throw new LibraryImportError('That file comes from a newer version of the site. Reload the page and try again.')
  }
  const library = parseLibrary(data.library, known)
  if (!library) throw new LibraryImportError('That file doesn’t contain a library.')
  return library
}
