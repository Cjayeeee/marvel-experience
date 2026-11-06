import { Link } from 'react-router'
import { FavouriteButton } from '@/features/library/FavouriteButton'
import { useWatchStatus } from '@/features/library/useLibrary'
import { cn } from '@/lib/cn'
import { phaseLabel } from '@/services/titles.service'
import type { Title } from '@/types/title'
import { TitlePoster } from './TitlePoster'

type TitleCardProps = {
  title: Title
  tone?: 'void' | 'paper'
}

/** Poster card for a film or series. */
export function TitleCard({ title, tone = 'void' }: TitleCardProps) {
  const year = title.releaseDate.slice(0, 4)
  const watch = useWatchStatus(title.id)
  // The favourite button sits beside the link (a button can't go inside one).
  return (
    <div className="relative h-full">
      <Link
        to={`/titles/${title.id}`}
        className={cn(
          'group flex h-full flex-col gap-3 p-3 transition-colors duration-300',
          tone === 'void' ? 'bg-void-raised hover:bg-void-card' : 'bg-paper-dim hover:bg-ink hover:text-paper',
        )}
      >
        <div className="flex justify-between font-mono text-[0.65rem] tracking-[0.12em] uppercase opacity-70">
          <span>{title.kind === 'film' ? 'Film' : 'Series'}</span>
          <span>{title.scheduled ? 'Coming' : year}</span>
        </div>
        <div className="relative">
          <TitlePoster
            title={title}
            className="aspect-[2/3] grayscale-[0.35] transition-[filter,transform] duration-500 group-hover:grayscale-0"
          />
          {title.scheduled ? (
            <span className="absolute top-2 left-2 rounded-full bg-red px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] text-white uppercase">
              Scheduled
            </span>
          ) : null}
          {watch ? (
            <span
              className={cn(
                'absolute top-2 right-2 rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase',
                watch === 'watched' ? 'bg-bone text-ink' : 'border border-bone/60 bg-void/80 text-bone',
              )}
            >
              {watch === 'watched' ? '✓ Watched' : 'On watchlist'}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 pr-11">
          <span className="font-display text-lg uppercase leading-[1.02] group-hover:text-red-bright">
            {title.title}
          </span>
          <span className="font-mono text-[0.62rem] tracking-[0.12em] uppercase opacity-60">
            {phaseLabel(title.phase)}
          </span>
        </div>
      </Link>
      <FavouriteButton
        kind="title"
        id={title.id}
        name={title.title}
        tone={tone}
        className="absolute right-3 bottom-3 size-9"
      />
    </div>
  )
}
