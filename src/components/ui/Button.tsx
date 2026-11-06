import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'ink'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display uppercase tracking-[0.04em] leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-300 ease-(--ease-cinematic) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-red text-white hover:bg-red-bright',
  ghost:
    'border border-current text-current hover:bg-bone hover:text-ink hover:border-bone',
  ink: 'bg-ink text-paper hover:bg-red hover:text-white',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-[1.1rem]',
}

type StyleProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: Omit<StyleProps, 'children'>) {
  return cn(base, variants[variant], sizes[size], className)
}

type ButtonProps = StyleProps & ComponentProps<'button'>

export function Button({
  variant,
  size,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  )
}

type ButtonLinkProps = StyleProps & ComponentProps<typeof Link>

export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  )
}
