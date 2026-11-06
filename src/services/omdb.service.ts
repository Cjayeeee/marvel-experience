import type { Title, TitleDetails } from '@/types/title'

/**
 * OMDb client (https://www.omdbapi.com). Data is CC BY-NC 4.0 — credited in
 * the footer and on title pages.
 *
 * The key comes from VITE_OMDB_API_KEY in .env.local. In Milestone 6 this
 * moves behind a Supabase Edge Function so the key never reaches the browser.
 *
 * Responses are cached in localStorage for a week: the free tier allows
 * 1,000 requests a day, and catalogue data rarely changes.
 */

const ENDPOINT = 'https://www.omdbapi.com/'
const CACHE_PREFIX = 'mm:omdb:v1:'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

export class OmdbKeyMissingError extends Error {
  constructor() {
    super('No OMDb API key configured. Add VITE_OMDB_API_KEY to .env.local and restart the dev server.')
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

export function hasOmdbKey(): boolean {
  return Boolean(import.meta.env.VITE_OMDB_API_KEY)
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

/** Compare titles loosely: case, punctuation and a leading "The" don't matter. */
function sameTitle(a: string, b: string): boolean {
  const n = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/^the\s+/, '')
      .replace(/[^a-z0-9]/g, '')
  const x = n(a)
  const y = n(b)
  return x === y || x.startsWith(y) || y.startsWith(x)
}

async function request(params: Record<string, string>): Promise<RawOmdb> {
  const key = import.meta.env.VITE_OMDB_API_KEY
  if (!key) throw new OmdbKeyMissingError()
  const url = new URL(ENDPOINT)
  for (const [k, v] of Object.entries({ ...params, apikey: key })) url.searchParams.set(k, v)

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new OmdbError('Could not reach OMDb. Check your connection.', 'network')
  }
  // OMDb answers 401 for a bad key; the body still carries the error.
  const raw = (await response.json().catch(() => ({}))) as RawOmdb
  if (raw.Response === 'False') {
    const message = raw.Error ?? 'Unknown OMDb error'
    if (/invalid api key|no api key/i.test(message)) throw new OmdbError(message, 'key')
    if (/limit/i.test(message)) throw new OmdbError(message, 'quota')
    throw new OmdbError(message, 'not-found')
  }
  if (!response.ok) throw new OmdbError(`OMDb responded with ${response.status}`, 'network')
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

/**
 * Details for a catalogue title. Looks up by IMDb id and checks the returned
 * title actually matches; if not (or no id is known), searches by title + year.
 */
export async function getTitleDetails(title: Title): Promise<TitleDetails> {
  const cached = readCache(title.id)
  if (cached) return cached

  const type = title.kind === 'film' ? 'movie' : 'series'
  let details: TitleDetails | null = null

  if (title.imdbId) {
    const byId = normalizeDetails(await request({ i: title.imdbId, plot: 'full' }))
    if (sameTitle(byId.title, title.title)) details = byId
    else console.warn(`[omdb] ${title.imdbId} returned "${byId.title}", expected "${title.title}" — searching by title`)
  }

  if (!details) {
    const year = title.releaseDate.slice(0, 4)
    details = normalizeDetails(await request({ t: title.title, y: year, type, plot: 'full' }))
  }

  writeCache(title.id, details)
  return details
}

/** Ask Amazon's image service for a larger poster than OMDb's default 300px. */
export function largePoster(url: string, width = 800): string {
  return url.replace(/_SX\d+(\.\w+)$/, `_SX${width}$1`)
}
