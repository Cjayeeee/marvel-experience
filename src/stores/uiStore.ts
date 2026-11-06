import { create } from 'zustand'
import { shouldPlayIntro } from '@/features/intro/introSession'

type UiState = {
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void

  /** True while the opening title sequence covers (or is about to cover) the screen. */
  introPlaying: boolean
  setIntroPlaying: (playing: boolean) => void
}

/** App-wide UI state that more than one component reads. */
export const useUiStore = create<UiState>((set) => ({
  menuOpen: false,
  openMenu: () => set({ menuOpen: true }),
  closeMenu: () => set({ menuOpen: false }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  // Decided once at startup so the hero knows to wait before its entrance.
  introPlaying:
    typeof window !== 'undefined' && shouldPlayIntro(window.location.pathname, window.location.search),
  setIntroPlaying: (playing) => set({ introPlaying: playing }),
}))
