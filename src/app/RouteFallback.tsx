/** Shown while a lazily loaded route chunk downloads. */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70dvh] items-center justify-center bg-void"
    >
      <span className="relative block h-px w-40 overflow-hidden bg-line">
        <span className="absolute inset-y-0 left-0 w-1/3 animate-[marquee_1.2s_linear_infinite] bg-red" />
      </span>
      <span className="sr-only">Loading</span>
    </div>
  )
}
