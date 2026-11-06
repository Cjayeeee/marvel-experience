/**
 * Backlit gothic stained-glass window (original artwork, drawn in SVG).
 * Pointed lancets of green panes held in dark leading, with round tracery in
 * the arch head. Panes nearer the light (upper right) are lighter.
 * Deterministic: the same window renders every time.
 */

const W = 1200
const H = 1000

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pointed (gothic) arch from x0 to x1, springing at y, rising `rise` above it, down to the bottom. */
const lancet = (x0: number, x1: number, spring: number, rise: number) => {
  const mid = (x0 + x1) / 2
  return `M${x0} ${H} L${x0} ${spring} Q${x0} ${spring - rise * 0.75} ${mid} ${spring - rise} Q${x1} ${spring - rise * 0.75} ${x1} ${spring} L${x1} ${H} Z`
}

type Pane = { d: string; fill: string }

function buildWindow() {
  const rand = mulberry32(616)
  const lancets = [
    { x0: 60, x1: 250, spring: 330, rise: 170 },
    { x0: 290, x1: 520, spring: 250, rise: 210 },
    { x0: 560, x1: 790, spring: 210, rise: 230 },
    { x0: 830, x1: 1000, spring: 270, rise: 190 },
    { x0: 1040, x1: 1170, spring: 340, rise: 150 },
  ]
  const panes: Pane[] = []
  // Light source, in viewBox units.
  const lx = 860
  const ly = 180

  const shade = (cx: number, cy: number) => {
    const dist = Math.hypot(cx - lx, cy - ly) / Math.hypot(W, H)
    const light = Math.max(0, 1 - dist * 1.6)
    const l = 14 + light * 52 + rand() * 12
    const s = 45 + rand() * 25
    const h = 118 + rand() * 22
    return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`
  }

  lancets.forEach(({ x0, x1, spring, rise }) => {
    let y = spring - rise
    while (y < H) {
      const h = 26 + rand() * 54
      const y1 = Math.min(H, y + h)
      // Split each row into 1–3 panes; sometimes a chevron (art-deco) row.
      const cols = rand() < 0.2 ? 2 : rand() < 0.65 ? 3 : 4
      const cw = (x1 - x0) / cols
      for (let c = 0; c < cols; c++) {
        const a = x0 + c * cw
        const b = a + cw
        if (rand() < 0.16 && h > 48) {
          const m = (a + b) / 2
          panes.push({ d: `M${a} ${y} L${m} ${y + h * 0.45} L${b} ${y} Z`, fill: shade(m, y) })
          panes.push({ d: `M${a} ${y} L${m} ${y + h * 0.45} L${b} ${y} L${b} ${y1} L${a} ${y1} Z`, fill: shade(m, y1) })
        } else {
          panes.push({ d: `M${a} ${y} H${b} V${y1} H${a} Z`, fill: shade((a + b) / 2, (y + y1) / 2) })
        }
      }
      y = y1
    }
  })

  // Round tracery between the lancet heads.
  const tracery = [
    { cx: 270, cy: 170, r: 46 },
    { cx: 540, cy: 70, r: 40 },
    { cx: 810, cy: 90, r: 44 },
    { cx: 1020, cy: 170, r: 38 },
  ].map((t) => ({ ...t, fill: shade(t.cx, t.cy) }))

  return { lancets, panes, tracery }
}

// The design never changes, so build it once.
const WINDOW = buildWindow()

export function StainedGlass({ className }: { className?: string }) {
  const { lancets, panes, tracery } = WINDOW
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="doom-lancets">
          {lancets.map((l, i) => (
            <path key={i} d={lancet(l.x0, l.x1, l.spring, l.rise)} />
          ))}
        </clipPath>
      </defs>

      {/* Glass */}
      <g clipPath="url(#doom-lancets)">
        {panes.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} stroke="#020503" strokeWidth={3.5} strokeLinejoin="round" />
        ))}
      </g>
      {tracery.map((t, i) => (
        <g key={i}>
          <circle cx={t.cx} cy={t.cy} r={t.r} fill={t.fill} stroke="#020503" strokeWidth={7} />
          <circle cx={t.cx} cy={t.cy} r={t.r * 0.45} fill="none" stroke="#020503" strokeWidth={5} />
          {[0, 45, 90, 135].map((deg) => (
            <line
              key={deg}
              x1={t.cx - t.r}
              y1={t.cy}
              x2={t.cx + t.r}
              y2={t.cy}
              stroke="#020503"
              strokeWidth={4}
              transform={`rotate(${deg} ${t.cx} ${t.cy})`}
            />
          ))}
        </g>
      ))}

      {/* Stone frame around each lancet */}
      {lancets.map((l, i) => (
        <path key={i} d={lancet(l.x0, l.x1, l.spring, l.rise)} fill="none" stroke="#010302" strokeWidth={11} />
      ))}
    </svg>
  )
}
