import { cn } from '@/lib/cn'
import type { Title } from '@/types/title'
import type { WatchStatus } from '@/types/library'
import { libraryActions, useWatchStatus } from './useLibrary'

const OPTIONS: { status: WatchStatus; label: string }[] = [
  { status: 'want', label: 'Want to watch' },
  { status: 'watched', label: 'Watched' },
]

/**
 * Watchlist status for a title: two toggles, at most one on. Pressing the
 * active one clears it. Unreleased titles can only be added as "want".
 */
export function WatchControl({ title, className }: { title: Title; className?: string }) {
  const status = useWatchStatus(title.id)

  return (
    <div role="group" aria-label={`Watchlist: ${title.title}`} className={cn('inline-flex w-fit rounded-full border border-line p-1', className)}>
      {OPTIONS.map((option) => {
        const active = status === option.status
        const disabled = option.status === 'watched' && Boolean(title.scheduled)
        return (
          <button
            key={option.status}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            title={disabled ? 'Not released yet' : undefined}
            onClick={() => libraryActions.setWatchStatus(title.id, active ? null : option.status)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full px-4 font-display text-[0.9rem] tracking-[0.04em] uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
              active ? (option.status === 'watched' ? 'bg-bone text-ink' : 'bg-red text-white') : 'hover:text-red-bright',
            )}
          >
            <span aria-hidden="true" className="font-mono text-xs">
              {option.status === 'watched' ? '✓' : '+'}
            </span>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
