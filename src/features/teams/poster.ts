import { characterArtwork } from '@/data/curated/artwork'
import { universeById } from '@/data/curated/universes'
import { attributeLabels, averageRatings } from '@/services/ratings.service'
import { POWER_ATTRIBUTES, type Character } from '@/types/character'
import type { TeamRole } from '@/types/library'
import { roleInfo } from './roles'

export type PosterTeam = {
  name: string
  members: Character[]
  leader: string | null
  roles: Partial<Record<string, TeamRole>>
}

export const POSTER_WIDTH = 1080
export const POSTER_HEIGHT = 1350

const C = {
  paper: '#eee6d8',
  ink: '#0a0a0a',
  inkMute: '#5b554d',
  void: '#121011',
  bone: '#eee6d8',
  red: '#e62429',
}
const DISPLAY = 'Anton, Impact, "Arial Narrow", sans-serif'
const MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'
const M = 64

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/** Draw `img` to fill the box, cropped like CSS object-cover with object-position center 22%. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.naturalWidth - sw) / 2
  const sy = (img.naturalHeight - sh) * 0.22
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

/** Split text into at most `maxLines` lines that fit `width` at the current font. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number): string[] | null {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= width) line = next
    else {
      if (!line || ctx.measureText(word).width > width) return null
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.length <= maxLines ? lines : null
}

/** The largest font size (from `start` down) at which `text` fits in `maxLines` lines. */
function fitText(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number, start: number, min: number) {
  for (let size = start; size >= min; size -= 4) {
    ctx.font = `${size}px ${DISPLAY}`
    const lines = wrap(ctx, text, width, maxLines)
    if (lines) return { size, lines }
  }
  ctx.font = `${min}px ${DISPLAY}`
  return { size: min, lines: [text] }
}

function monogram(name: string) {
  return name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Render the team poster as a PNG blob. Runs only in the browser. */
export async function renderTeamPoster(team: PosterTeam): Promise<Blob> {
  await Promise.all([document.fonts.load(`120px ${DISPLAY}`), document.fonts.load(`20px ${MONO}`)])
  const images = await Promise.all(
    team.members.map((c) => (characterArtwork[c.slug] ? loadImage(characterArtwork[c.slug]!.full) : Promise.resolve(null))),
  )

  const canvas = document.createElement('canvas')
  canvas.width = POSTER_WIDTH
  canvas.height = POSTER_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  // Paper, with a faint halftone in the top corner.
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)
  ctx.fillStyle = 'rgba(10,10,10,0.07)'
  for (let y = 0; y < 420; y += 14) {
    for (let x = POSTER_WIDTH - 420; x < POSTER_WIDTH; x += 14) {
      const r = Math.max(0, 3.2 * (1 - Math.hypot(POSTER_WIDTH - x, y) / 520))
      if (r > 0.3) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Header.
  ctx.textBaseline = 'alphabetic'
  ctx.font = `500 20px ${MONO}`
  ctx.fillStyle = C.inkMute
  ctx.textAlign = 'left'
  ctx.fillText('MULTIVERSE · TEAM FILE', M, 84)
  ctx.textAlign = 'right'
  ctx.fillText(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(), POSTER_WIDTH - M, 84)
  ctx.fillStyle = 'rgba(10,10,10,0.25)'
  ctx.fillRect(M, 104, POSTER_WIDTH - M * 2, 2)

  // Team name.
  const { size, lines } = fitText(ctx, team.name.toUpperCase(), POSTER_WIDTH - M * 2, 2, 168, 72)
  ctx.font = `${size}px ${DISPLAY}`
  ctx.textAlign = 'left'
  ctx.fillStyle = C.ink
  let y = 118 + size * 0.92
  lines.forEach((line, i) => {
    ctx.fillStyle = i === lines.length - 1 && lines.length > 1 ? C.red : C.ink
    ctx.fillText(line, M - 4, y)
    y += size * 0.9
  })
  // `y` has stepped one line past the last baseline.
  const nameBottom = y - size * 0.9
  if (lines.length === 1) {
    ctx.fillStyle = C.red
    ctx.fillRect(M, nameBottom + 22, 180, 10)
  }

  // Subtitle.
  const leader = team.members.find((c) => c.slug === team.leader)
  const realities = new Set(team.members.map((c) => c.universe)).size
  const subtitle = [
    `${team.members.length} ${team.members.length === 1 ? 'MEMBER' : 'MEMBERS'}`,
    `${realities} ${realities === 1 ? 'REALITY' : 'REALITIES'}`,
    leader
      ? `LED BY ${leader.name}${
          leader.alias && team.members.some((m) => m.slug !== leader.slug && m.name === leader.name) ? ` (${leader.alias})` : ''
        }`.toUpperCase()
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const gridTop = nameBottom + (lines.length === 1 ? 84 : 62)
  ctx.font = `500 22px ${MONO}`
  ctx.fillStyle = C.inkMute
  ctx.fillText(subtitle, M, gridTop)

  // Member grid.
  const n = team.members.length
  const cols = n <= 3 ? Math.max(n, 1) : n === 4 ? 2 : 3
  const rows = Math.ceil(n / cols)
  const gap = 16
  const top = gridTop + 32
  const bottom = POSTER_HEIGHT - 170
  const cellW = (POSTER_WIDTH - M * 2 - gap * (cols - 1)) / cols
  const cellH = Math.min((bottom - top - gap * (rows - 1)) / rows, cellW * 1.6)
  const caption = Math.min(118, cellH * 0.3)

  team.members.forEach((c, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    // Centre a short last row.
    const inRow = row === rows - 1 ? n - row * cols : cols
    const offset = ((cols - inRow) * (cellW + gap)) / 2
    const x = M + offset + col * (cellW + gap)
    const cy = top + row * (cellH + gap)
    const artH = cellH - caption
    const isLeader = c.slug === team.leader

    ctx.fillStyle = C.void
    ctx.fillRect(x, cy, cellW, cellH)
    const img = images[i]
    if (img) drawCover(ctx, img, x, cy, cellW, artH)
    else {
      ctx.fillStyle = '#2a2627'
      ctx.fillRect(x, cy, cellW, artH)
      ctx.fillStyle = C.bone
      ctx.textAlign = 'center'
      ctx.font = `${Math.round(artH * 0.4)}px ${DISPLAY}`
      ctx.fillText(monogram(c.name), x + cellW / 2, cy + artH * 0.64)
    }

    // Caption strip.
    ctx.textAlign = 'left'
    const pad = 18
    const nameSize = fitText(ctx, c.name.toUpperCase(), cellW - pad * 2, 1, Math.round(caption * 0.42), 20).size
    ctx.font = `${nameSize}px ${DISPLAY}`
    ctx.fillStyle = C.bone
    ctx.fillText(c.name.toUpperCase(), x + pad, cy + artH + caption * 0.52)
    ctx.font = `500 ${Math.round(Math.max(14, caption * 0.16))}px ${MONO}`
    ctx.fillStyle = C.red
    const role = roleInfo[team.roles[c.slug] ?? 'wildcard'].label.toUpperCase()
    ctx.fillText(`${role} · ${universeById(c.universe)?.designation ?? ''}`.toUpperCase(), x + pad, cy + artH + caption * 0.8)

    if (isLeader) {
      ctx.strokeStyle = C.red
      ctx.lineWidth = 8
      ctx.strokeRect(x + 4, cy + 4, cellW - 8, cellH - 8)
      ctx.fillStyle = C.red
      ctx.font = `500 18px ${MONO}`
      const label = '★ LEADER'
      const w = ctx.measureText(label).width + 28
      ctx.fillRect(x + 4, cy + 4, w, 38)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(label, x + 18, cy + 30)
    }
  })

  // Footer: team averages + disclaimer.
  const avg = averageRatings(team.members.map((c) => c.slug))
  ctx.fillStyle = 'rgba(10,10,10,0.25)'
  ctx.fillRect(M, POSTER_HEIGHT - 140, POSTER_WIDTH - M * 2, 2)
  if (avg) {
    const slot = (POSTER_WIDTH - M * 2) / POWER_ATTRIBUTES.length
    POWER_ATTRIBUTES.forEach((a, i) => {
      const x = M + i * slot
      ctx.textAlign = 'left'
      ctx.fillStyle = C.ink
      ctx.font = `44px ${DISPLAY}`
      ctx.fillText(avg[a].toFixed(1), x, POSTER_HEIGHT - 84)
      ctx.fillStyle = C.inkMute
      ctx.font = `500 16px ${MONO}`
      ctx.fillText(attributeLabels[a].short, x + ctx.measureText('0.0').width * 2.2 + 6, POSTER_HEIGHT - 86)
    })
  }
  ctx.font = `500 15px ${MONO}`
  ctx.fillStyle = C.inkMute
  ctx.textAlign = 'left'
  ctx.fillText('TEAM AVERAGE · EDITORIAL ESTIMATES, 1–7 · UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH MARVEL', M, POSTER_HEIGHT - 44)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))), 'image/png'),
  )
}
