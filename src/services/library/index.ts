import { createLibraryStore } from './libraryStore'
import { createLocalAdapter } from './localAdapter'
import { parseExport, type KnownIds } from './schema'

/**
 * Valid ids, loaded in the background: the header uses the library on every
 * page, and this keeps the full character and title data out of the main bundle.
 */
const known: Promise<KnownIds> = Promise.all([import('@/data/curated/characters'), import('@/data/curated/titles')]).then(
  ([c, t]) => ({
    characters: new Set(c.characters.map((x) => x.slug)),
    titles: new Set(t.titles.map((x) => x.id)),
  }),
)

/**
 * The site's library, kept in this browser. To move it to a database later,
 * swap createLocalAdapter() for a database adapter here; nothing else changes.
 */
export const libraryStore = createLibraryStore(createLocalAdapter(), known)

/** Check an export file before importing it. Throws LibraryImportError. */
export async function previewImport(text: string) {
  const library = parseExport(text, await known)
  return {
    characters: library.favourites.characters.length,
    titles: library.favourites.titles.length,
    watchlist: Object.keys(library.watchlist).length,
    teams: library.teams.length,
  }
}

export type { ImportMode, ImportSummary, LibraryState, TeamDraft } from './libraryStore'
export { LibraryImportError } from './schema'
