import { useState } from 'react'
import { ArtworkSlot } from '@/components/ui/ArtworkSlot'
import { cn } from '@/lib/cn'
import { useInView } from '@/lib/useInView'
import { largePoster } from '@/services/omdb.service'
import type { Title } from '@/types/title'
import { useTitleDetails } from './queries'

type TitlePosterProps = {
  title: Title
  className?: string
  /** Request a larger image (detail page). */
  large?: boolean
  /** Fetch immediately instead of waiting to scroll into view. */
  eager?: boolean
  decorative?: boolean
}

/**
 * Poster from OMDb, fetched when the card nears the viewport. Falls back to
 * the monogram placeholder while loading, without a key, or if it fails.
 */
export function TitlePoster({ title, className, large = false, eager = false, decorative = true }: TitlePosterProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { data, isPending } = useTitleDetails(title, eager || inView)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const poster = data?.poster ?? null
  const preferred = poster && large ? largePoster(poster) : poster
  // If the enlarged URL fails, fall back to OMDb's original; if that fails, the placeholder.
  const src = preferred && failedSrc !== preferred ? preferred : poster && failedSrc !== poster ? poster : null

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-void-card', className)}>
      {src ? (
        <img
          src={src}
          alt={decorative ? '' : `${title.title} poster`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <ArtworkSlot
          label={title.title}
          decorative
          className={cn('absolute inset-0 size-full', isPending && (eager || inView) && 'animate-pulse')}
        />
      )}
    </div>
  )
}
