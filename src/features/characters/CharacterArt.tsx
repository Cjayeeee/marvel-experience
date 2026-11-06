import { useState } from 'react'
import { ArtworkSlot } from '@/components/ui/ArtworkSlot'
import { characterArtwork } from '@/data/curated/artwork'
import { cn } from '@/lib/cn'
import type { Character } from '@/types/character'

type CharacterArtProps = {
  character: Pick<Character, 'slug' | 'name'>
  className?: string
  tone?: 'void' | 'paper' | 'red'
  /** Hide from assistive tech when the name is already announced nearby. */
  decorative?: boolean
  /** Load eagerly (above-the-fold art). */
  priority?: boolean
  /** How wide the image displays, so the browser picks the right file. Defaults to grid-card widths. */
  sizes?: string
}

const CARD_SIZES = '(min-width: 1280px) 22vw, (min-width: 768px) 32vw, 48vw'

/** Character portrait from the artwork manifest, or the monogram placeholder. */
export function CharacterArt({
  character,
  className,
  tone = 'void',
  decorative = false,
  priority = false,
  sizes = CARD_SIZES,
}: CharacterArtProps) {
  const art = characterArtwork[character.slug]
  const [failed, setFailed] = useState(false)

  if (!art || failed) {
    return <ArtworkSlot label={character.name} tone={tone} decorative={decorative} className={className} />
  }

  return (
    <img
      src={art.thumb}
      srcSet={art.thumb === art.full ? undefined : `${art.thumb} 420w, ${art.full} 720w`}
      sizes={sizes}
      alt={decorative ? '' : character.name}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover object-[center_22%]', className)}
    />
  )
}
