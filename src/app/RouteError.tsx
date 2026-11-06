import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'

/** Error boundary for every route: 404s and thrown errors. */
export function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (!notFound) console.error(error)
  return <ErrorScreen notFound={notFound} />
}

/** Catch-all route: renders inside the layout, so header and footer stay. */
export function NotFoundPage() {
  return <ErrorScreen notFound />
}

function ErrorScreen({ notFound }: { notFound: boolean }) {
  return (
    <section className="flex min-h-dvh items-center bg-void py-32 text-bone">
      <Container className="flex flex-col gap-8">
        <Eyebrow className="text-mute">
          {notFound ? 'Error 404 · Reality not found' : 'System fault · Unhandled anomaly'}
        </Eyebrow>
        <SectionHeading
          as="h1"
          size="giant"
          lead={notFound ? 'This reality' : 'Something'}
          accent={notFound ? "doesn't exist" : 'broke the timeline'}
        />
        <p className="max-w-md text-mute">
          {notFound
            ? 'The page you were looking for was pruned, or never branched off in the first place.'
            : 'An unexpected error stopped this page from loading. Try again, or head back to the start.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/" size="lg">
            Return to Earth-616
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
