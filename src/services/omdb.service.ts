import type { Title, TitleDetails } from '@/types/title'

/**
 * OMDb details, fetched through the site's own /api/omdb function
 * (api/omdb.ts). The key stays on the server: OMDB_API_KEY in .env.local for
 * `npm run dev`, or in the Vercel project settings for the live site.
 * Data is CC BY-NC 4.0, credited in the footer and on title pages.
 *
 * Answers are also cached in localStorage for a week, on top of Vercel's
 * shared CDN cache, so revisits cost no requests at all.
 */

const ENDPOINT = '/api/omdb'
const CACHE_PREFIX = 'mm:omdb:v2:'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

/** The server has no OMDB_API_KEY configured. */
export class OmdbKeyMissingError extends Error {
  constructor() {
    super('The server has no OMDb key. Set OMDB_API_KEY (in .env.local, or in your Vercel project settings).')
    this.name = 'OmdbKeyMissingError'
  }
}

export type OmdbErrorReason = 'key' | 'quota' | 'not-found' | 'network'

export class OmdbError extends Error {
  /** "key" = invalid key, "quota" = daily limit reached, "not-found", "network". */
  readonly reason: OmdbErrorReason
  constructor(message: string, reason: OmdbErrorReason) {
    super(message)
    this.name = 'OmdbError'
    this.reason = reason
  }
}

type RawOmdb = Record<string, unknown> & { Response?: string; Error?: string }

function value(raw: RawOmdb, key: string): string | null {
  const v = raw[key]
  return typeof v === 'string' && v.trim() && v !== 'N/A' ? v.trim() : null
}

function list(raw: RawOmdb, key: string): string[] {
  return (value(raw, key) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeDetails(raw: RawOmdb): TitleDetails {
  const ratings = Array.isArray(raw.Ratings)
    ? (raw.Ratings as { Source?: string; Value?: string }[])
        .filter((r) => r.Source && r.Value)
        .map((r) => ({ source: r.Source as string, value: r.Value as string }))
    : []
  return {
    imdbId: value(raw, 'imdbID') ?? '',
    title: value(raw, 'Title') ?? '',
    year: value(raw, 'Year') ?? '',
    rated: value(raw, 'Rated'),
    released: value(raw, 'Released'),
    runtime: value(raw, 'Runtime'),
    genres: list(raw, 'Genre'),
    directors: list(raw, 'Director'),
    writers: list(raw, 'Writer'),
    actors: list(raw, 'Actors'),
    plot: value(raw, 'Plot'),
    poster: value(raw, 'Poster'),
    ratings,
    imdbRating: value(raw, 'imdbRating'),
    awards: value(raw, 'Awards'),
    boxOffice: value(raw, 'BoxOffice'),
    totalSeasons: value(raw, 'totalSeasons'),
  }
}

async function request(id: string): Promise<RawOmdb> {
  let response: Response
  try {
    response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`)
  } catch {
    throw new OmdbError('Could not reach the site. Check your connection.', 'network')
  }
  const raw = (await response.json().catch(() => ({}))) as RawOmdb & { code?: string }
  if (raw.Response === 'False' || !response.ok) {
    const message = raw.Error ?? `OMDb proxy responded with ${response.status}`
    switch (raw.code) {
      case 'key-missing':
        throw new OmdbKeyMissingError()
      case 'key':
        throw new OmdbError(message, 'key')
      case 'quota':
        throw new OmdbError(message, 'quota')
      case 'not-found':
      case 'bad-request':
        throw new OmdbError(message, 'not-found')
      default:
        throw new OmdbError(message, 'network')
    }
  }
  return raw
}

function readCache(id: string): TitleDetails | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + id)
    if (!raw) return null
    const entry = JSON.parse(raw) as { at: number; data: TitleDetails }
    return Date.now() - entry.at < CACHE_TTL ? entry.data : null
  } catch {
    return null
  }
}

function writeCache(id: string, data: TitleDetails) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // Storage full or unavailable: the request simply isn't cached.
  }
}

/** Details for a catalogue title (the server picks the right OMDb lookup). */
export async function getTitleDetails(title: Title): Promise<TitleDetails> {
  const cached = readCache(title.id)
  if (cached) return cached
  const details = normalizeDetails(await request(title.id))
  writeCache(title.id, details)
  return details
}

/** Ask Amazon's image service for a larger poster than OMDb's default 300px. */
export function largePoster(url: string, width = 800): string {
  return url.replace(/_SX\d+(\.\w+)$/, `_SX${width}$1`)
}
