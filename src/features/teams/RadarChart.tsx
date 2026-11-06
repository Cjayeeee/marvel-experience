import { attributeLabels, RATING_MAX } from '@/services/ratings.service'
import { POWER_ATTRIBUTES, type PowerRatings } from '@/types/character'

const SIZE = 320
const CENTER = SIZE / 2
const RADIUS = 112

/** Point for attribute i at value v (0..RATING_MAX), clockwise from the top. */
function point(i: number, v: number): [number, number] {
  const angle = (Math.PI * 2 * i) / POWER_ATTRIBUTES.length - Math.PI / 2
  const r = (v / RATING_MAX) * RADIUS
  return [CENTER + Math.cos(angle) * r, CENTER + Math.sin(angle) * r]
}

const toPath = (values: number[]) =>
  values.map((v, i) => point(i, v).map((n) => n.toFixed(1)).join(' ')).reduce((d, p, i) => `${d}${i ? 'L' : 'M'}${p} `, '') + 'Z'

/**
 * Hexagon of the six ratings. The shape morphs between teams where the
 * browser can transition the SVG `d` property; elsewhere it just updates.
 */
export function RadarChart({ ratings, label }: { ratings: PowerRatings | null; label: string }) {
  const values = POWER_ATTRIBUTES.map((a) => ratings?.[a] ?? 0)
  const shape = toPath(values)

  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-labelledby="radar-title" className="w-full max-w-[22rem] overflow-visible">
        <title id="radar-title">
          {ratings
            ? `${label}: ${POWER_ATTRIBUTES.map((a) => `${attributeLabels[a].label} ${ratings[a].toFixed(1)}`).join(', ')}`
            : `${label}: no members yet`}
        </title>
        {[1, 2, 3, 4, 5, 6, 7].map((ring) => (
          <path
            key={ring}
            d={toPath(POWER_ATTRIBUTES.map(() => ring))}
            fill="none"
            className={ring === RATING_MAX ? 'stroke-bone/40' : 'stroke-line'}
            strokeWidth={1}
          />
        ))}
        {POWER_ATTRIBUTES.map((a, i) => {
          const [x, y] = point(i, RATING_MAX)
          const [lx, ly] = point(i, RATING_MAX + 1.15)
          return (
            <g key={a}>
              <line x1={CENTER} y1={CENTER} x2={x} y2={y} className="stroke-line" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-mute font-mono text-[11px] tracking-[0.12em]"
              >
                {attributeLabels[a].short}
              </text>
            </g>
          )
        })}
        <path
          style={{ d: `path('${shape}')` }}
          d={shape}
          className="fill-red/25 stroke-red transition-[d] duration-700 ease-(--ease-cinematic) motion-reduce:transition-none"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
      <figcaption className="font-mono text-[0.62rem] tracking-[0.12em] text-mute uppercase">
        Team average · editorial estimates, 1–7
      </figcaption>
    </figure>
  )
}
