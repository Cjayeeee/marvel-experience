/**
 * GET /api/omdb?id=<catalogue id>
 *
 * Server-side OMDb proxy (a Vercel Function; `npm run dev` serves it too via
 * the plugin in vite.config.ts). The key lives in the OMDB_API_KEY environment
 * variable and never reaches the browser.
 *
 * Only ids from the curated catalogue are accepted, so the endpoint can't be
 * used for arbitrary lookups that would burn the daily quota. Successful
 * answers are cached by Vercel's CDN for a week and shared by every visitor.
 *
 * The body is OMDb's own JSON on success. Errors are
 * { Response: "False", Error: string, code: OmdbProxyErrorCode }.
 */
import { titles } from '../src/data/curated/titles.js'

export type OmdbProxyErrorCode = 'bad-request' | 'key-missing' | 'key' | 'quota' | 'not-found' | 'upstream'

type RawOmdb = Record<string, unknown> & { Response?: string; Error?: string; Title?: string }

/** OMDB_ENDPOINT exists only so tests can point the proxy at a fake OMDb. */
const endpoint = () => process.env.OMDB_ENDPOINT || 'https://www.omdbapi.com/'

const WEEK = 7 * 24 * 60 * 60
const DAY = 24 * 60 * 60

function json(body: unknown, status: number, cache: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  })
}

function fail(code: OmdbProxyErrorCode, message: string, status: number, cache = 'no-store'): Response {
  return json({ Response: 'False', Error: message, code }, status, cache)
}

/** Compare titles loosely: case, accents, punctuation and a leading "The" don't matter. */
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

class UpstreamError extends Error {
  readonly code: OmdbProxyErrorCode
  constructor(message: string, code: OmdbProxyErrorCode) {
    super(message)
    this.code = code
  }
}

async function omdb(params: Record<string, string>, key: string, signal: AbortSignal): Promise<RawOmdb> {
  const url = new URL(endpoint())
  for (const [k, v] of Object.entries({ ...params, apikey: key })) url.searchParams.set(k, v)

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch {
    throw new UpstreamError('Could not reach OMDb.', 'upstream')
  }
  // OMDb answers 401 for a bad key; the body still carries the error.
  const raw = (await response.json().catch(() => ({}))) as RawOmdb
  if (raw.Response === 'False') {
    const message = raw.Error ?? 'Unknown OMDb error'
    if (/invalid api key|no api key/i.test(message)) throw new UpstreamError(message, 'key')
    if (/limit/i.test(message)) throw new UpstreamError(message, 'quota')
    throw new UpstreamError(message, 'not-found')
  }
  if (!response.ok) throw new UpstreamError(`OMDb responded with ${response.status}`, 'upstream')
  return raw
}

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? ''
  const title = titles.find((t) => t.id === id)
  if (!title) return fail('bad-request', 'Unknown title id.', 400, `public, s-maxage=${DAY}`)

  const key = process.env.OMDB_API_KEY
  if (!key) return fail('key-missing', 'OMDB_API_KEY is not set on the server.', 503)

  const signal = AbortSignal.timeout(8000)
  try {
    if (title.imdbId) {
      const byId = await omdb({ i: title.imdbId, plot: 'full' }, key, signal)
      if (sameTitle(byId.Title ?? '', title.title)) {
        return json(byId, 200, `public, max-age=${DAY}, s-maxage=${WEEK}, stale-while-revalidate=${DAY}`)
      }
      console.warn(`[omdb] ${title.imdbId} returned "${byId.Title}", expected "${title.title}"; searching by title`)
    }
    const byTitle = await omdb(
      { t: title.title, y: title.releaseDate.slice(0, 4), type: title.kind === 'film' ? 'movie' : 'series', plot: 'full' },
      key,
      signal,
    )
    return json(byTitle, 200, `public, max-age=${DAY}, s-maxage=${WEEK}, stale-while-revalidate=${DAY}`)
  } catch (error) {
    if (error instanceof UpstreamError) {
      if (error.code === 'not-found') return fail('not-found', error.message, 404, `public, s-maxage=${DAY}`)
      if (error.code === 'quota') return fail('quota', error.message, 429)
      if (error.code === 'key') return fail('key', error.message, 502)
      return fail('upstream', error.message, 502)
    }
    return fail('upstream', 'Unexpected error contacting OMDb.', 502)
  }
}
