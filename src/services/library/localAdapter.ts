import type { Library } from '@/types/library'
import type { LibraryAdapter } from './adapter'

export const LIBRARY_STORAGE_KEY = 'mm:library:v1'

/** Error thrown when the browser refuses to store the library (private mode, full storage). */
export class LibraryStorageError extends Error {
  constructor() {
    super('This browser isn’t letting the site save data. Your changes will last until you close the tab.')
    this.name = 'LibraryStorageError'
  }
}

/** The library in this browser's localStorage, synced across open tabs. */
export function createLocalAdapter(storage: Storage | undefined = globalThis.localStorage): LibraryAdapter {
  return {
    async load() {
      try {
        const text = storage?.getItem(LIBRARY_STORAGE_KEY)
        return text ? (JSON.parse(text) as unknown) : null
      } catch {
        return null
      }
    },

    async save(library: Library) {
      try {
        storage?.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library))
      } catch {
        throw new LibraryStorageError()
      }
    },

    subscribe(onChange) {
      if (typeof window === 'undefined') return () => {}
      // Fires in other tabs when this key changes.
      const listener = (event: StorageEvent) => {
        if (event.key !== LIBRARY_STORAGE_KEY) return
        try {
          onChange(event.newValue ? (JSON.parse(event.newValue) as unknown) : null)
        } catch {
          // Ignore a half-written or corrupt value; the next change will sync.
        }
      }
      window.addEventListener('storage', listener)
      return () => window.removeEventListener('storage', listener)
    },
  }
}
