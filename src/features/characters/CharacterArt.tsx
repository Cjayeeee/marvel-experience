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
}

/** Character portrait from the artwork manifest, or the monogram placeholder. */
export function CharacterArt({ character, className, tone = 'void', decorative = false, priority = false }: CharacterArtProps) {
  const src = characterArtwork[character.slug]
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <ArtworkSlot label={character.name} tone={tone} decorative={decorative} className={className} />
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : character.name}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover object-[center_22%]', className)}
    />
  )
}
