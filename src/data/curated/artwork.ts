/**
 * Character artwork.
 *
 * Drop image files into `src/assets/characters/`, named after the character's
 * slug (e.g. `iron-man.webp`, `spider-man-miles-morales.jpg`). They are picked up
 * automatically at build time — no code changes needed. Portraits around
 * 900×1200 (3:4) work best. The full list of slugs is in
 * `src/assets/characters/README.md`.
 *
 * Characters without a file keep the styled monogram placeholder, and a file
 * that fails to load falls back to it too.
 */
const files = import.meta.glob<string>('/src/assets/characters/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
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

const fromFolder: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const slug = slugFromPath(path)
  if (slug) fromFolder[slug] = url
}

/** Optional manual overrides (e.g. a URL to an image hosted elsewhere). */
const overrides: Record<string, string> = {}

export const characterArtwork: Record<string, string> = { ...fromFolder, ...overrides }
