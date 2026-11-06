import earthStill from '@/assets/earth/earth-still.webp'
import { cn } from '@/lib/cn'

type PortalFallbackProps = {
  className?: string
}

/**
 * Static portal sphere: a still frame of the 3D globe (captured from the live
 * scene at its starting rotation) over a CSS gradient that shows instantly.
 * It covers the 3D globe while that loads, so the cross-fade is near-seamless,
 * and it's the globe for devices without WebGL or with reduced motion.
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
            'inset -26px -18px 60px rgba(230, 36, 41, 0.55), inset 10px 8px 30px rgba(255, 255, 255, 0.08)',
        }}
      />
      <div
        className="halftone absolute inset-0 rounded-full text-black opacity-50 mix-blend-multiply"
        style={{ maskImage: 'radial-gradient(circle at 70% 70%, black 10%, transparent 62%)' }}
      />
      <img
        src={earthStill}
        alt=""
        width={720}
        height={720}
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full rounded-full select-none"
      />
    </div>
  )
}
