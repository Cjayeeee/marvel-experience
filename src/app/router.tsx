import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'
import { NotFoundPage, RouteError } from './RouteError'
import { RouteFallback } from './RouteFallback'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home/HomePage')
          return { Component: HomePage }
        },
      },
      {
        path: 'characters',
        lazy: async () => {
          const { CharactersPage } = await import('@/pages/characters/CharactersPage')
          return { Component: CharactersPage }
        },
      },
      {
        path: 'characters/:slug',
        lazy: async () => {
          const { CharacterDossierPage } = await import('@/pages/characters/CharacterDossierPage')
          return { Component: CharacterDossierPage }
        },
      },
      {
        path: 'multiverse',
        lazy: async () => {
          const { MultiversePage } = await import('@/pages/multiverse/MultiversePage')
          return { Component: MultiversePage }
        },
      },
      {
        path: 'movies',
        lazy: async () => {
          const { TitlesPage } = await import('@/pages/titles/TitlesPage')
          return { Component: () => <TitlesPage kind="film" /> }
        },
      },
      {
        path: 'series',
        lazy: async () => {
          const { TitlesPage } = await import('@/pages/titles/TitlesPage')
          return { Component: () => <TitlesPage kind="series" /> }
        },
      },
      {
        path: 'titles/:id',
        lazy: async () => {
          const { TitleDetailPage } = await import('@/pages/titles/TitleDetailPage')
          return { Component: TitleDetailPage }
        },
      },
      {
        path: 'timeline',
        lazy: async () => {
          const { TimelinePage } = await import('@/pages/timeline/TimelinePage')
          return { Component: TimelinePage }
        },
      },
      {
        path: 'team-builder',
        lazy: async () => {
          const { TeamBuilderPage } = await import('@/pages/team-builder/TeamBuilderPage')
          return { Component: TeamBuilderPage }
        },
      },
      {
        path: 'doomsday',
        lazy: async () => {
          const { DoomsdayPage } = await import('@/pages/doomsday/DoomsdayPage')
          return { Component: DoomsdayPage }
        },
      },
      {
        path: 'arena',
        lazy: async () => {
          const { ArenaPage } = await import('@/pages/arena/ArenaPage')
          return { Component: ArenaPage }
        },
      },
      {
        path: 'me',
        lazy: async () => {
          const { ArchivePage } = await import('@/pages/archive/ArchivePage')
          return { Component: ArchivePage }
        },
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
