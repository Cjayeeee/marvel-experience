import { NavLink } from 'react-router'
import { Wordmark } from '@/components/brand/Wordmark'
import { primaryNav } from '@/config/navigation'
import { useLibrary } from '@/features/library/useLibrary'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/stores/uiStore'

/**
 * Fixed header. `mix-blend-difference` keeps it legible over both the paper
 * hero and the void sections without per-section colour switching.
 */
export function SiteHeader() {
  const menuOpen = useUiStore((s) => s.menuOpen)
  const openMenu = useUiStore((s) => s.openMenu)
  const archiveCount = useLibrary((s) => {
    const { favourites, watchlist, teams } = s.library
    return favourites.characters.length + favourites.titles.length + Object.keys(watchlist).length + teams.length
  })

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 text-white mix-blend-difference">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
        <Wordmark className="pointer-events-auto" />

        <nav aria-label="Primary" className="pointer-events-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative py-2 font-mono text-[0.74rem] uppercase tracking-[0.12em] transition-opacity hover:opacity-100',
                      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-(--ease-cinematic) hover:after:scale-x-100',
                      isActive ? 'opacity-100 after:scale-x-100' : 'opacity-75',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pointer-events-auto flex items-center gap-5">
          <NavLink
            to="/me"
            className="hidden items-center font-mono text-[0.74rem] uppercase tracking-[0.12em] opacity-75 transition-opacity hover:opacity-100 sm:flex"
          >
            My archive
            {archiveCount ? (
              <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-white px-1.5 py-0.5 text-[0.62rem] leading-none text-black">
                {archiveCount}
                <span className="sr-only"> saved</span>
              </span>
            ) : null}
          </NavLink>
          <button
            type="button"
            onClick={openMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="group flex h-11 items-center gap-3 lg:hidden"
          >
            <span className="font-mono text-[0.74rem] uppercase tracking-[0.12em]">Menu</span>
            <span aria-hidden="true" className="flex w-7 flex-col gap-1.5">
              <span className="h-0.5 w-full bg-current" />
              <span className="h-0.5 w-2/3 bg-current transition-[width] duration-300 group-hover:w-full" />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
