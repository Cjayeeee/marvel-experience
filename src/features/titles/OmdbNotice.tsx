import { Eyebrow } from '@/components/ui/Typography'
import { cn } from '@/lib/cn'
import { OmdbError, OmdbKeyMissingError } from '@/services/omdb.service'

type OmdbNoticeProps = {
  /** An error from a details query, if any. */
  error?: unknown
  className?: string
}

/**
 * Explains why posters/details are missing: no key on the server, a rejected
 * key, or the daily limit. Renders nothing when everything is fine.
 */
export function OmdbNotice({ error, className }: OmdbNoticeProps) {
  let heading: string | null = null
  let body: string | null = null

  if (error instanceof OmdbKeyMissingError) {
    heading = 'Posters and details are offline'
    body = import.meta.env.DEV
      ? 'Add OMDB_API_KEY=your-key to .env.local in the project folder, then restart the dev server.'
      : 'The OMDB_API_KEY environment variable is not set for this deployment. Add it in Vercel and redeploy.'
  } else if (error instanceof OmdbError && error.reason === 'key') {
    heading = 'OMDb rejected the API key'
    body = 'Check the OMDB_API_KEY value. New keys only work after you click the activation link OMDb emails you.'
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
