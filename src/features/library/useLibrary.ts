import { useStore } from 'zustand'
import { libraryStore, type LibraryState } from '@/services/library'
import type { FavouriteKind, WatchStatus } from '@/types/library'

/** Read from the library store; re-renders only when the selected value changes. */
export function useLibrary<T>(selector: (state: LibraryState) => T): T {
  return useStore(libraryStore, selector)
}

export function useIsFavourite(kind: FavouriteKind, id: string): boolean {
  return useLibrary((s) => (kind === 'character' ? s.library.favourites.characters : s.library.favourites.titles).includes(id))
}

export function useWatchStatus(titleId: string): WatchStatus | null {
  return useLibrary((s) => s.library.watchlist[titleId]?.status ?? null)
}

/** Actions don't change, so components can call these without subscribing. */
export const libraryActions = {
  toggleFavourite: (...args: Parameters<LibraryState['toggleFavourite']>) => libraryStore.getState().toggleFavourite(...args),
  setWatchStatus: (...args: Parameters<LibraryState['setWatchStatus']>) => libraryStore.getState().setWatchStatus(...args),
  saveTeam: (...args: Parameters<LibraryState['saveTeam']>) => libraryStore.getState().saveTeam(...args),
  getTeam: (id: string) => libraryStore.getState().library.teams.find((t) => t.id === id),
  deleteTeam: (...args: Parameters<LibraryState['deleteTeam']>) => libraryStore.getState().deleteTeam(...args),
  exportText: () => libraryStore.getState().exportText(),
  importText: (...args: Parameters<LibraryState['importText']>) => libraryStore.getState().importText(...args),
  clear: () => libraryStore.getState().clear(),
}
