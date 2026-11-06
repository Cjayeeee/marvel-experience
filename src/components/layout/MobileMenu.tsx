import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router'
import { Wordmark } from '@/components/brand/Wordmark'
import { primaryNav } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/stores/uiStore'

/** Full-screen menu for tablet and phone. Escape closes; focus is trapped. */
export function MobileMenu() {
  const open = useUiStore((s) => s.menuOpen)
  const closeMenu = useUiStore((s) => s.closeMenu)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      )
    focusables()[1]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, closeMenu])

  return (
    <div
      id="site-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      hidden={!open}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-void text-bone lg:hidden"
    >
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Wordmark onNavigate={closeMenu} />
        <button
          type="button"
          onClick={closeMenu}
          className="flex h-11 items-center gap-3 font-mono text-[0.74rem] uppercase tracking-[0.12em]"
        >
          Close
          <span aria-hidden="true" className="relative block size-5">
            <span className="absolute top-1/2 left-0 h-0.5 w-full rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 h-0.5 w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 px-5 pt-6 pb-10 sm:px-8">
        <ul className="border-t border-line">
          {primaryNav.map((item) => (
            <li key={item.to} className="border-b border-line">
              <NavLink
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-baseline gap-4 py-4 font-display text-[clamp(2.4rem,11vw,4.5rem)] uppercase leading-[0.95] transition-colors hover:text-red-bright',
                    isActive && 'text-red-bright',
                  )
                }
              >
                <span className="w-8 shrink-0 font-mono text-[0.75rem] tracking-[0.1em] text-mute">
                  {item.index}
                </span>
                {item.label}
                {item.live ? (
                  <span aria-hidden="true" className="relative ml-1 inline-flex size-2.5 self-center">
                    <span className="absolute inset-0 rounded-full bg-red opacity-75 motion-safe:animate-ping" />
                    <span className="relative size-2.5 rounded-full bg-red" />
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.78rem] uppercase tracking-[0.12em]">
          <Link to="/me" onClick={closeMenu} className="underline-offset-4 hover:underline">
            My archive
          </Link>
        </div>
      </nav>
    </div>
  )
}
