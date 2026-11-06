import { cn } from '@/lib/cn'
import type { FavouriteKind } from '@/types/library'
import { libraryActions, useIsFavourite } from './useLibrary'

type FavouriteButtonProps = {
  kind: FavouriteKind
  id: string
  /** Shown to screen readers, e.g. "Iron Man". */
  name: string
  /** "icon": small round button for cards. "pill": labelled button for detail pages. */
  variant?: 'icon' | 'pill'
  /** Background the button sits on. */
  tone?: 'void' | 'paper'
  className?: string
}

export function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Adds or removes a character or title from the visitor's favourites. */
export function FavouriteButton({ kind, id, name, variant = 'icon', tone = 'void', className }: FavouriteButtonProps) {
  const on = useIsFavourite(kind, id)

  // Re-keying the icon restarts its pop animation each time it's switched on.
  const icon = (
    <span key={on ? 'on' : 'off'} className={cn('block', on && 'motion-safe:animate-[fav-pop_0.5s_var(--ease-cinematic)]')}>
      <StarIcon filled={on} className={variant === 'icon' ? 'size-[1.15rem]' : 'size-5'} />
    </span>
  )

  if (variant === 'pill') {
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => libraryActions.toggleFavourite(kind, id)}
        className={cn(
          'inline-flex h-11 w-fit items-center gap-2.5 rounded-full border px-5 font-display text-[0.95rem] tracking-[0.04em] uppercase transition-[background-color,color,border-color] duration-300 active:scale-[0.97]',
          on
            ? 'border-red bg-red text-white hover:bg-red-bright'
            : tone === 'paper'
              ? 'border-ink text-ink hover:bg-ink hover:text-paper'
              : 'border-bone/60 text-bone hover:border-bone hover:bg-bone hover:text-ink',
          className,
        )}
      >
        {icon}
        {on ? 'In favourites' : 'Add to favourites'}
        <span className="sr-only">: {name}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Favourite ${name}`}
      title={on ? 'Remove from favourites' : 'Add to favourites'}
      onClick={() => libraryActions.toggleFavourite(kind, id)}
      className={cn(
        'flex size-10 items-center justify-center rounded-full border backdrop-blur-sm transition-[background-color,color,border-color,transform] duration-300 active:scale-90',
        on
          ? 'border-red bg-red text-white hover:bg-red-bright'
          : tone === 'paper'
            ? 'border-ink/30 bg-paper/80 text-ink hover:border-ink'
            : 'border-bone/25 bg-void/70 text-bone hover:border-bone',
        className,
      )}
    >
      {icon}
    </button>
  )
}
