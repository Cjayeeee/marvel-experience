import { Suspense, useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { IntroSequence } from '@/features/intro/IntroSequence'
import { RouteTransition } from '@/motion/RouteTransition'
import { useSmoothScroll } from '@/motion/smoothScroll'
import { useUiStore } from '@/stores/uiStore'
import { RouteFallback } from './RouteFallback'

export function RootLayout() {
  const { pathname } = useLocation()
  const closeMenu = useUiStore((s) => s.closeMenu)
  useSmoothScroll()

  // Any navigation closes the mobile menu.
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-red px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />
      <MobileMenu />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <RouteTransition />
      <IntroSequence />
      <ScrollRestoration />
    </>
  )
}
