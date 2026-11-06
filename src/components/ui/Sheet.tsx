import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Bottom sheet built on the native <dialog> element: focus trapping,
 * Escape-to-close and an inert background come from the browser.
 */
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (event.target === event.currentTarget) onClose()
      }}
      aria-label={title}
      className={cn(
        'm-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-void p-0 text-bone backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex max-h-[88dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl uppercase">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-2 font-mono text-[0.72rem] tracking-[0.12em] uppercase"
          >
            Close
          </button>
        </div>
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          {children}
        </div>
        {footer ? <div className="border-t border-line px-5 py-4">{footer}</div> : null}
      </div>
    </dialog>
  )
}
