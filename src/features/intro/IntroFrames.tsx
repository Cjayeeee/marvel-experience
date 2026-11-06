/**
 * The "image" cuts between intro words. All drawn in code from the site's own
 * visual language, and deliberately dark: every frame stays close to black in
 * brightness so the cut rhythm never becomes a photosensitive flash.
 * (Later these can be swapped for darkened film stills.)
 */

export function FrameSphere() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute top-1/2 left-[62%] aspect-square w-[95vmax] -translate-1/2 rounded-full opacity-45"
        style={{
          background:
            'radial-gradient(circle at 30% 28%, #8d877f 0%, #3c3735 16%, #141213 42%, #000 70%)',
          boxShadow: 'inset -60px -40px 120px rgba(230, 36, 41, 0.45)',
        }}
      />
      <div className="halftone absolute inset-0 text-black opacity-70" />
    </div>
  )
}

export function FrameOrbits() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      <svg viewBox="0 0 1000 600" className="h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx="500"
            cy="300"
            rx={140 + i * 90}
            ry={40 + i * 26}
            transform={`rotate(${-18 + i * 3} 500 300)`}
            fill="none"
            stroke="#eee6d8"
            strokeWidth="1.2"
          />
        ))}
        <circle cx="500" cy="300" r="58" fill="#1b1819" />
        <circle cx="812" cy="214" r="9" fill="#e62429" />
      </svg>
    </div>
  )
}

export function FrameBlueprint() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(#3a3536 1px, transparent 1px), linear-gradient(90deg, #3a3536 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full opacity-55" preserveAspectRatio="none">
        <g stroke="#e62429" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
          <line x1="50" y1="30" x2="18" y2="12" />
          <line x1="50" y1="30" x2="84" y2="16" />
          <line x1="50" y1="30" x2="28" y2="50" />
          <line x1="50" y1="30" x2="78" y2="48" />
        </g>
      </svg>
      <p className="absolute bottom-[8%] left-[6%] font-mono text-sm tracking-[0.2em] text-mute/70">
        EARTH-616 · LOCATING
      </p>
    </div>
  )
}

export function FrameHalftone() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="halftone absolute inset-0 text-red opacity-35"
        style={{
          backgroundSize: '14px 14px',
          maskImage: 'radial-gradient(ellipse at 30% 60%, black 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

export function FrameDossier() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="absolute top-[20%] -left-[5%] h-[60%] w-[110%] -rotate-3 bg-paper opacity-[0.1]" />
      <p className="absolute top-[30%] left-[8%] font-mono text-[clamp(0.8rem,2vw,1.4rem)] tracking-[0.3em] text-mute/60">
        FILE 0000 · CLASSIFIED
      </p>
      <div className="absolute top-[46%] left-[8%] h-[6%] w-[46%] bg-black/90" />
      <div className="absolute top-[58%] left-[8%] h-[6%] w-[30%] bg-black/90" />
    </div>
  )
}

