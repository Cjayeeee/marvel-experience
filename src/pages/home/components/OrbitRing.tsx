import { useId } from 'react'
import { cn } from '@/lib/cn'

type OrbitRingProps = {
  /** Which half to draw: the back half sits behind the sphere, the front half over it. */
  half: 'back' | 'front'
  text: string
  className?: string
}

/*
 * One continuous elliptical orbit (centre 500,200 · radii 480×120), drawn twice.
 * It starts at the top-middle (hidden behind the sphere, so the seam where the
 * text wraps is never seen) and runs anticlockwise: across the top (words
 * upside-down, the far side), then left → right along the bottom (words upright).
 *
 * Each copy is cut to its half with a CSS clip-path on the <svg> element itself,
 * which renders consistently across browsers (SVG <clipPath> on text does not).
 */
const ORBIT =
  'M500,80 A480,120 0 0,0 20,200 A480,120 0 0,0 500,320 A480,120 0 0,0 980,200 A480,120 0 0,0 500,80'

/** Enough copies to cover the whole orbit plus one extra for seamless drifting. */
const REPEATS = 5

const CLIP = {
  // Generous side/outer margins so glyphs that overhang the box are not cut.
  front: 'inset(50% -25% -40% -25%)',
  back: 'inset(-40% -25% 50% -25%)',
} as const

/**
 * A tilted orbit with words running along it (Orbita's ring text).
 * Decorative only. Render once per half; the hero animates the words'
 * `startOffset` (via `data-orbit-text`) so they drift around the planet.
 */
export function OrbitRing({ half, text, className }: OrbitRingProps) {
  const pathId = `orbit-${half}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const repeated = Array.from({ length: REPEATS }, () => text).join(' ')

  return (
    <svg
      viewBox="0 0 1000 400"
      aria-hidden="true"
      className={cn('pointer-events-none overflow-visible', className)}
      style={{ clipPath: CLIP[half] }}
    >
      <defs>
        <path id={pathId} d={ORBIT} />
      </defs>
      <path d={ORBIT} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <text
        className="font-display"
        fontSize="40"
        letterSpacing="2"
        fill="currentColor"
        dy="-10"
        opacity={half === 'back' ? 0.45 : 1}
      >
        <textPath data-orbit-text data-repeats={REPEATS} href={`#${pathId}`} startOffset="0">
          {repeated}
        </textPath>
      </text>
    </svg>
  )
}
