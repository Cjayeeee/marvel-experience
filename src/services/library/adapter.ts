import type { Library } from '@/types/library'

/**
 * Where the library is kept. The site talks only to this interface, so
 * switching storage is one new file:
 *
 * - localAdapter (now): this browser's localStorage.
 * - a future supabaseAdapter: load() selects the signed-in user's rows,
 *   save() upserts them, subscribe() listens on a realtime channel.
 *
 * Methods are async even though localStorage isn't, so callers already
 * handle the network case.
 */
export interface LibraryAdapter {
  /** The stored library, or null if nothing has been saved yet. */
  load(): Promise<unknown>
  save(library: Library): Promise<void>
  /** Called when the library changes elsewhere (another tab, another device). */
  subscribe(onChange: (raw: unknown) => void): () => void
}
