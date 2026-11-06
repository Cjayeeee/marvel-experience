import { Link } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Typography'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { cn } from '@/lib/cn'
import type { UniverseDetail } from '@/services/universes.service'
import { mediumColor, mediumLabel } from './layout'

type UniversePanelProps = {
  detail: UniverseDetail
  onSelect: (id: string) => void
  onClose: () => void
  className?: string
}

const RESIDENT_PREVIEW = 8

/** Detail file for the selected reality: residents, crossings, key stories. */
export function UniversePanel({ detail, onSelect, onClose, className }: UniversePanelProps) {
  const { universe, characters, crossings } = detail
  const extra = characters.length - RESIDENT_PREVIEW

  return (
    <article
      aria-labelledby="universe-panel-title"
      className={cn('flex flex-col gap-7 bg-void/92 p-6 text-bone backdrop-blur-md sm:p-7', className)}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow className="flex items-center gap-2 text-mute">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: mediumColor[universe.medium] }} />
            {mediumLabel[universe.medium]} · Reality file
          </Eyebrow>
          <h2 id="universe-panel-title" className="font-display text-[clamp(2.4rem,4vw,3.5rem)] uppercase leading-[0.9]">
            {universe.designation}
          </h2>
          <p className="font-mono text-[0.75rem] tracking-[0.12em] text-red-bright uppercase">{universe.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 shrink-0 items-center rounded-full border border-line px-4 font-mono text-[0.68rem] tracking-[0.12em] uppercase hover:border-bone"
        >
          Overview
        </button>
      </header>

      <p className="leading-relaxed text-bone/85">{universe.description}</p>

      <dl className="grid grid-cols-2 border-y border-line">
        <div className="border-r border-line py-3 pr-3">
          <dt>
            <Eyebrow as="span" className="text-mute">
              On file
            </Eyebrow>
          </dt>
          <dd className="font-display text-3xl">{characters.length}</dd>
        </div>
        <div className="py-3 pl-4">
          <dt>
            <Eyebrow as="span" className="text-mute">
              Crossings
            </Eyebrow>
          </dt>
          <dd className="font-display text-3xl">{crossings.length}</dd>
        </div>
      </dl>

      {characters.length ? (
        <section className="flex flex-col gap-3">
          <Eyebrow as="h3" className="text-mute">
            Residents on file
          </Eyebrow>
          <ul className="grid grid-cols-4 gap-2">
            {characters.slice(0, RESIDENT_PREVIEW).map((c) => (
              <li key={c.slug}>
                <Link to={`/characters/${c.slug}`} className="group flex flex-col gap-1" title={c.name}>
                  <CharacterArt
                    character={c}
                    decorative
                    sizes="96px"
                    className="aspect-square w-full grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                  />
                  <span className="truncate font-display text-[0.8rem] uppercase leading-tight group-hover:text-red-bright">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {extra > 0 ? <p className="font-mono text-[0.7rem] text-mute">+ {extra} more in the archive</p> : null}
        </section>
      ) : null}

      {characters.length === 0 ? (
        <p className="border-l-2 border-line pl-4 text-sm leading-snug text-mute">
          No character files are assigned to this reality yet. The archive files characters under the reality
          where they first appeared, which for most of them is Earth-616.
        </p>
      ) : null}

      {crossings.length ? (
        <section className="flex flex-col gap-3">
          <Eyebrow as="h3" className="text-mute">
            Crossings
          </Eyebrow>
          <ol className="flex flex-col border-t border-line">
            {crossings.map((x) => (
              <li key={x.id} className="flex flex-col gap-1.5 border-b border-line py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg uppercase leading-tight">{x.event}</span>
                  <span className="shrink-0 font-mono text-[0.65rem] text-mute uppercase">
                    {x.kind} · {x.year}
                  </span>
                </div>
                <p className="text-sm leading-snug text-bone/75">{x.summary}</p>
                <button
                  type="button"
                  onClick={() => onSelect(x.other.id)}
                  className="w-fit font-mono text-[0.68rem] tracking-[0.12em] text-red-bright uppercase underline-offset-4 hover:underline"
                >
                  Travel to {x.other.designation} →
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <Eyebrow as="h3" className="text-mute">
          Key stories
        </Eyebrow>
        <ul className="flex flex-col gap-1.5">
          {universe.notable.map((n) => (
            <li key={`${n.title}-${n.year}`} className="flex items-baseline justify-between gap-3 text-sm">
              <span>{n.title}</span>
              <span className="shrink-0 font-mono text-[0.65rem] text-mute uppercase">
                {n.kind} · {n.year}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        {characters.length ? (
          <ButtonLink to={`/characters?universe=${universe.id}`}>Browse residents</ButtonLink>
        ) : null}
        {universe.id === 'earth-199999' ? (
          <ButtonLink to="/timeline" variant={characters.length ? 'ghost' : 'primary'}>
            Open the MCU timeline
          </ButtonLink>
        ) : null}
      </div>
    </article>
  )
}
