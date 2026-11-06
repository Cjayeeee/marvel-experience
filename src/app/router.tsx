import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'
import { NotFoundPage, RouteError } from './RouteError'
import { RouteFallback } from './RouteFallback'

/** Lazily load one named export from the stub module (one shared chunk). */
const stub =
  (name: keyof typeof import('@/pages/stubs/StubPages')) => async () => {
    const pages = await import('@/pages/stubs/StubPages')
    return { Component: pages[name] }
  }

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
      { path: 'team-builder', lazy: stub('TeamBuilderStub') },
      { path: 'arena', lazy: stub('ArenaStub') },
      { path: 'me', lazy: stub('ProfileStub') },
      { path: 'login', lazy: stub('LoginStub') },
      { path: 'signup', lazy: stub('SignupStub') },
      { path: 'reset-password', lazy: stub('ResetPasswordStub') },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
