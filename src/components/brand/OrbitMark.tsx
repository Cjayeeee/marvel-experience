import { cn } from '@/lib/cn'

type OrbitMarkProps = {
  className?: string
}

/** Original brand mark: a planet crossed by a tilted orbit. Decorative. */
export function OrbitMark({ className }: OrbitMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <circle cx="20" cy="20" r="9" fill="currentColor" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="6.5"
        transform="rotate(-24 20 20)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="35.2" cy="13.6" r="2.6" fill="var(--color-red)" />
    </svg>
  )
}
