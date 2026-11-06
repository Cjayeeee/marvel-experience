import { cn } from '@/lib/cn'

type PortalFallbackProps = {
  className?: string
}

/**
 * Static portal sphere. Stands in for the WebGL portal until Milestone 2,
 * then stays as the fallback for devices without WebGL or with reduced motion.
 */
export function PortalFallback({ className }: PortalFallbackProps) {
  return (
    <div aria-hidden="true" className={cn('aspect-square rounded-full', className)}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 34% 30%, #f6f1e8 0%, #b9b2a8 9%, #5d5754 26%, #1d1a1b 52%, #050505 74%)',
          boxShadow:
            'inset -26px -18px 60px rgba(230, 36, 41, 0.55), inset 10px 8px 30px rgba(255, 255, 255, 0.08), 0 40px 80px -30px rgba(0, 0, 0, 0.6)',
        }}
      />
      <div
        className="halftone absolute inset-0 rounded-full text-black opacity-50 mix-blend-multiply"
        style={{ maskImage: 'radial-gradient(circle at 70% 70%, black 10%, transparent 62%)' }}
      />
    </div>
  )
}
