import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { OrbitMark } from './OrbitMark'

type WordmarkProps = {
  className?: string
  onNavigate?: () => void
}

/** Site wordmark. Original lettering — deliberately not Marvel's logo. */
export function Wordmark({ className, onNavigate }: WordmarkProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Multiverse — home"
    >
      <OrbitMark className="size-7 transition-transform duration-700 ease-(--ease-cinematic) group-hover:rotate-[24deg]" />
      <span className="font-display text-[1.35rem] leading-none tracking-[0.02em]">
        MULTIVERSE
      </span>
    </Link>
  )
}
