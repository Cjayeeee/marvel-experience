/**
 * Character artwork.
 *
 * Drop image files into `src/assets/characters/`, named after the character's
 * slug (e.g. `iron-man.webp`, `spider-man-miles-morales.jpg`). They are picked up
 * automatically at build time, with no code changes needed. Portraits around
 * 900×1200 (3:4) work best. The full list of slugs is in
 * `src/assets/characters/README.md`.
 *
 * Characters without a file keep the styled monogram placeholder, and a file
 * that fails to load falls back to it too.
 */
/*
 * Each image is built in two sizes by vite-imagetools (see vite.config.ts),
 * cropped to 3:4 from the top, which is the most any page shows. The originals
 * stay untouched in src/assets; only these WebP copies ship.
 */
const thumbs = import.meta.glob<string>('/src/assets/characters/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=420&aspect=3:4&fit=cover&position=top&withoutEnlargement&format=webp&quality=72',
  import: 'default',
})
const fulls = import.meta.glob<string>('/src/assets/characters/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=720&aspect=3:4&fit=cover&position=top&withoutEnlargement&format=webp&quality=78',
  import: 'default',
})


/** Common alternate file names, mapped to the archive slug. */
const aliases: Record<string, string> = {
  spiderman: 'spider-man',
  'peter-parker': 'spider-man',
  'miles-morales': 'spider-man-miles-morales',
  'mr-fantastic': 'mister-fantastic',
  'reed-richards': 'mister-fantastic',
  thing: 'the-thing',
  'ben-grimm': 'the-thing',
  yelena: 'yelena-belova',
  'winter-soldier': 'bucky',
  'bucky-barnes': 'bucky',
  'spiderman-2099': 'spider-man-2099',
  'gwen-stacy': 'ghost-spider',
  'spider-gwen': 'ghost-spider',
  'professor-xavier': 'professor-x',
  'kang-the-conqueror': 'kang',
}

/** "Mr_Fantastic.JPG" → "mr-fantastic" → "mister-fantastic" */
function slugFromPath(path: string): string | undefined {
  const stem = path.split('/').pop()?.replace(/\.[^.]+$/, '')
  if (!stem) return undefined
  const normalized = stem.toLowerCase().replace(/[\s_]+/g, '-')
  return aliases[normalized] ?? normalized
}

export type Artwork = {
  /** 420px wide: cards, tiles, thumbnails. */
  thumb: string
  /** Up to 720px wide: large portraits and the team poster. */
  full: string
}

const fromFolder: Record<string, Artwork> = {}
for (const [path, full] of Object.entries(fulls)) {
  const slug = slugFromPath(path)
  const thumb = thumbs[path]
  if (slug && thumb) fromFolder[slug] = { thumb, full }
}

/** Optional manual overrides (e.g. an image hosted elsewhere: use the same URL for both). */
const overrides: Record<string, Artwork> = {}

export const characterArtwork: Record<string, Artwork> = { ...fromFolder, ...overrides }
