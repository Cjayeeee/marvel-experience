import { Link } from 'react-router'
import { universeById } from '@/data/curated/universes'
import { cn } from '@/lib/cn'
import { FavouriteButton } from '@/features/library/FavouriteButton'
import { fileNumber } from '@/services/characters.service'
import type { Character } from '@/types/character'
import { categoryStyles } from './categoryStyles'
import { CharacterArt } from './CharacterArt'

type CharacterCardProps = {
  character: Character
  /** Larger "feature" card spanning two grid columns on wide screens. */
  feature?: boolean
}

/** Archive index card: duotone art, file number, universe, name and alias. */
export function CharacterCard({ character, feature = false }: CharacterCardProps) {
  const universe = universeById(character.universe)
  const category = categoryStyles[character.category]

  // The favourite button sits beside the link (a button can't go inside one),
  // pinned over the card's caption.
  return (
    <div className="group/card relative h-full transition-transform duration-500 ease-(--ease-cinematic) hover:-translate-y-1">
      <Link
        to={`/characters/${character.slug}`}
        className="group relative flex h-full flex-col overflow-hidden bg-void-raised outline-offset-4"
      >
        <div
          className={cn(
            'relative overflow-hidden',
            feature ? 'aspect-[3/4] md:aspect-[4/3] lg:flex-1' : 'aspect-[3/4]',
          )}
        >
          <CharacterArt
            character={character}
            decorative
            className="size-full grayscale transition-[transform,filter] duration-700 ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:grayscale-0"
          />
          {/* Red scanline that sweeps down on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 -translate-y-2 bg-red opacity-0 shadow-[0_0_18px_rgba(230,36,41,0.9)] transition-[translate,opacity] duration-700 ease-(--ease-portal) group-hover:translate-y-[min(60vh,40rem)] group-hover:opacity-100"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span className="font-mono text-[0.62rem] tracking-[0.14em] text-bone/70">
              FILE {fileNumber(character.slug)}
            </span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase',
                category.className,
              )}
            >
              {category.label}
            </span>
          </div>
          {character.tags.includes('variant') ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-paper px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] text-ink uppercase">
              Variant
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 border-t border-line px-3 pt-3 pr-14 pb-4">
          <span className="font-mono text-[0.62rem] tracking-[0.14em] text-red-bright uppercase">
            {universe?.designation}
          </span>
          <h3
            className={cn(
              'font-display uppercase leading-[0.95] transition-colors group-hover:text-red-bright',
              feature ? 'text-[clamp(1.35rem,3.4vw,3rem)]' : 'text-[clamp(1.35rem,2.2vw,1.9rem)]',
            )}
          >
            {character.name}
          </h3>
          {character.alias ? (
            <p className="font-mono text-[0.68rem] tracking-[0.1em] text-mute uppercase">{character.alias}</p>
          ) : null}
        </div>
      </Link>
      <FavouriteButton
        kind="character"
        id={character.slug}
        name={character.name}
        className="absolute right-3 bottom-3"
      />
    </div>
  )
}

/** Same footprint as a card, for loading states. */
export function CharacterCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col bg-void-raised">
      <div className="aspect-[3/4] animate-pulse bg-void-card" />
      <div className="flex flex-col gap-2 border-t border-line px-3 pt-3 pb-4">
        <div className="h-2.5 w-1/3 animate-pulse bg-line" />
        <div className="h-6 w-3/4 animate-pulse bg-line" />
        <div className="h-2.5 w-1/2 animate-pulse bg-line/70" />
      </div>
    </div>
  )
}
