import { Eyebrow } from '@/components/ui/Typography'
import { cn } from '@/lib/cn'
import type { Crossing, Universe } from '@/types/character'
import { mediumColor, universeLayout } from './layout'

type BlueprintMapProps = {
  universes: Universe[]
  crossings: Crossing[]
  selectedId: string | null
  onSelect: (id: string) => void
  className?: string
}

/**
 * Flat blueprint of the multiverse: the homepage preview and the fallback for
 * devices without WebGL or with reduced motion. Same data as the 3D map.
 */
export function BlueprintMap({ universes, crossings, selectedId, onSelect, className }: BlueprintMapProps) {
  return (
    <div className={cn('relative overflow-hidden border border-line bg-void', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {crossings.map((x) => {
          const a = universeLayout[x.from]?.map
          const b = universeLayout[x.to]?.map
          if (!a || !b) return null
          const lit = selectedId !== null && (x.from === selectedId || x.to === selectedId)
          return (
            <line
              key={x.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              vectorEffect="non-scaling-stroke"
              stroke={lit ? 'var(--color-red)' : 'var(--color-mute)'}
              strokeWidth={lit ? 1.5 : 1}
              strokeDasharray={lit ? undefined : '4 6'}
              opacity={lit ? 1 : 0.5}
            />
          )
        })}
      </svg>

      {universes.map((u) => {
        const p = universeLayout[u.id]?.map
        if (!p) return null
        const active = u.id === selectedId
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onSelect(u.id)}
            aria-label={`${u.designation}: ${u.name}`}
            aria-pressed={active}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <span
              className={cn(
                'block rounded-full border-2 transition-all duration-500 ease-(--ease-cinematic)',
                active ? 'size-6 shadow-[0_0_0_8px_rgba(230,36,41,0.2)]' : 'size-3.5 group-hover:size-5',
              )}
              style={{ borderColor: mediumColor[u.medium], background: active ? mediumColor[u.medium] : 'var(--color-void)' }}
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-full mt-0.5 font-mono text-[0.62rem] tracking-[0.08em] whitespace-nowrap',
                active ? 'text-bone' : 'text-mute',
              )}
            >
              {u.designation.replace('Earth-', '')}
            </span>
          </button>
        )
      })}

      <Eyebrow className="absolute top-3 left-4 text-mute">Cartography · Known realities</Eyebrow>
      <Eyebrow className="absolute right-4 bottom-3 text-mute">Not to scale</Eyebrow>
    </div>
  )
}
