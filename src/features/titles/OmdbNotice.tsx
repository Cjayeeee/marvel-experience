import { Eyebrow } from '@/components/ui/Typography'
import { cn } from '@/lib/cn'
import { hasOmdbKey, OmdbError, OmdbKeyMissingError } from '@/services/omdb.service'

type OmdbNoticeProps = {
  /** An error from a details query, if any. */
  error?: unknown
  className?: string
}

/**
 * Explains why posters/details are missing: no key configured, a rejected
 * key, or the daily limit. Renders nothing when everything is fine.
 */
export function OmdbNotice({ error, className }: OmdbNoticeProps) {
  let heading: string | null = null
  let body: string | null = null

  if (!hasOmdbKey() || error instanceof OmdbKeyMissingError) {
    heading = 'Posters and details are offline'
    body = 'Add your OMDb key to a file named .env.local in the project folder (VITE_OMDB_API_KEY=your-key), then restart the dev server.'
  } else if (error instanceof OmdbError && error.reason === 'key') {
    heading = 'OMDb rejected the API key'
    body = 'Check VITE_OMDB_API_KEY in .env.local. New keys only work after you click the activation link OMDb emails you.'
  } else if (error instanceof OmdbError && error.reason === 'quota') {
    heading = 'Daily OMDb limit reached'
    body = 'The free plan allows 1,000 requests a day. Anything already loaded stays cached; the rest returns tomorrow.'
  }

  if (!heading) return null
  return (
    <div role="status" className={cn('flex flex-col gap-1 border border-dashed border-current/40 px-4 py-3', className)}>
      <Eyebrow className="text-red-bright">{heading}</Eyebrow>
      <p className="text-sm opacity-80">{body}</p>
    </div>
  )
}
