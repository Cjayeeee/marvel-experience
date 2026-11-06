/**
 * The visitor's personal library: favourites, watchlist and saved teams.
 *
 * Stored in the browser today (src/services/library/localAdapter.ts). The
 * shape maps one-to-one onto future database tables (favourites, watchlist,
 * teams), so moving to Supabase means writing a new adapter, not changing pages.
 */

export const LIBRARY_VERSION = 1

/** Most characters a saved team can hold. */
export const TEAM_SIZE = 6

export type FavouriteKind = 'character' | 'title'

export type WatchStatus = 'want' | 'watched'

export type WatchEntry = {
  status: WatchStatus
  /** ISO time the status was last set. */
  at: string
}

export const TEAM_ROLES = ['powerhouse', 'tactician', 'scout', 'blaster', 'brawler', 'wildcard'] as const

export type TeamRole = (typeof TEAM_ROLES)[number]

export type SavedTeam = {
  id: string
  name: string
  /** Character slugs, at most TEAM_SIZE, no duplicates. */
  members: string[]
  /** One of `members`, or null. */
  leader: string | null
  /** Role per member slug. Members without a role are simply absent. */
  roles: Partial<Record<string, TeamRole>>
  createdAt: string
  updatedAt: string
}

export type Library = {
  version: typeof LIBRARY_VERSION
  favourites: {
    /** Character slugs, most recent first. */
    characters: string[]
    /** Title ids, most recent first. */
    titles: string[]
  }
  /** Keyed by title id. */
  watchlist: Record<string, WatchEntry>
  teams: SavedTeam[]
  updatedAt: string
}

/** The file written by "Export" and read by "Import". */
export type LibraryExport = {
  app: 'marvel-multiverse'
  exportedAt: string
  library: Library
}
