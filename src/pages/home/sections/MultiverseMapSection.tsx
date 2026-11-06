import { useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { BlueprintMap } from '@/features/multiverse/BlueprintMap'
import { mediumColor } from '@/features/multiverse/layout'
import { useCrossings, useUniverses } from '@/features/multiverse/queries'
import { cn } from '@/lib/cn'

/**
 * Blueprint preview of the multiverse (Orbita's seating plan, re-imagined).
 * Same data as the 3D map; "Enter the map" opens it on the chosen reality.
 */
export function MultiverseMapSection() {
  const { data: universes = [] } = useUniverses()
  const { data: crossings = [] } = useCrossings()
  const [selectedId, setSelectedId] = useState('earth-616')
  const selected = universes.find((u) => u.id === selectedId)

  return (
    <section aria-labelledby="map-heading" className="bg-void-raised py-24 text-bone sm:py-32">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading id="map-heading" lead="Explore the" accent="Multiverse" />
          <p className="max-w-md leading-relaxed text-bone/85">
            Every reality has a designation. Pick one to see what it holds, then step through the portal into
            the full 3D map.
          </p>

          <ul data-reveal="stagger" className="flex flex-col border-t border-line" aria-label="Universes">
            {universes.map((u) => {
              const active = u.id === selectedId
              return (
                <li key={u.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setSelectedId(u.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-3 py-3 text-left transition-colors',
                      active ? 'text-red-bright' : 'text-bone/75 hover:text-bone',
                    )}
                  >
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: mediumColor[u.medium] }} />
                    <span className="font-display text-2xl leading-none whitespace-nowrap uppercase">{u.designation}</span>
                    <span className="ml-auto hidden text-right font-mono text-[0.7rem] tracking-[0.1em] text-mute uppercase sm:block">
                      {u.name}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div>
            <ButtonLink to={`/multiverse?u=${selectedId}`} size="lg">
              Enter the map
            </ButtonLink>
          </div>
        </div>

        <div data-reveal="up" className="relative">
          <BlueprintMap
            universes={universes}
            crossings={crossings}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="aspect-[4/3]"
          />
          {selected ? (
            <div
              aria-live="polite"
              className="mt-4 flex flex-col gap-1 border-l-2 border-red bg-void px-5 py-4 sm:absolute sm:right-6 sm:bottom-14 sm:mt-0 sm:max-w-xs sm:border sm:border-line sm:border-l-line"
            >
              <Eyebrow className="text-mute">Selected reality</Eyebrow>
              <p className="font-display text-3xl uppercase leading-none">{selected.designation}</p>
              <p className="text-sm text-bone/80">{selected.name}</p>
              <p className="mt-1 font-mono text-[0.65rem] text-mute uppercase">
                {selected.characterCount} on file · {selected.crossingCount} crossings
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
