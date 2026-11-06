import { cn } from '@/lib/cn'

type ArtworkSlotProps = {
  /** Name the slot stands in for; its initials become the monogram. */
  label: string
  tone?: 'void' | 'paper' | 'red'
  className?: string
  /** Shows a small caption of where real artwork will come from. */
  caption?: string
  /** Purely ornamental: hidden from assistive tech. */
  decorative?: boolean
}

const tones = {
  void: 'bg-void-card text-bone',
  paper: 'bg-paper-dim text-ink',
  red: 'bg-red text-white',
}

function monogram(label: string): string {
  return label
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Stand-in for licensed artwork (TMDB / Marvel API images arrive in M3/M5).
 * Also the permanent fallback when an image is missing or fails to load.
 */
export function ArtworkSlot({
  label,
  tone = 'void',
  className,
  caption,
  decorative = false,
}: ArtworkSlotProps) {
  return (
    <div
      className={cn(
        'relative isolate flex overflow-hidden',
        tones[tone],
        className,
      )}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': `${label} — artwork placeholder` })}
    >
      <div className="halftone absolute inset-0 -z-10 opacity-[0.16]" />
      <span
        aria-hidden="true"
        className="m-auto font-display text-[clamp(3rem,9vw,7rem)] leading-none opacity-90"
      >
        {monogram(label)}
      </span>
      {caption ? (
        <span className="absolute bottom-2 left-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] opacity-60">
          {caption}
        </span>
      ) : null}
    </div>
  )
}
