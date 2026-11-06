import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { POSTER_HEIGHT, POSTER_WIDTH, renderTeamPoster, type PosterTeam } from './poster'

type State = { status: 'rendering' } | { status: 'ready'; url: string; blob: Blob } | { status: 'error'; message: string }

const fileName = (name: string) =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'team'
  }-poster.png`

/** Preview and download the team poster. Rendered on open. */
export function PosterDialog({ open, onClose, team }: { open: boolean; onClose: () => void; team: PosterTeam }) {
  const [state, setState] = useState<State>({ status: 'rendering' })

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    renderTeamPoster(team).then(
      (blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setState({ status: 'ready', url, blob })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not make the poster.' })
      },
    )
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
    // Render once per opening; the dialog unmounts when closed.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const share = async () => {
    if (state.status !== 'ready') return
    const file = new File([state.blob], fileName(team.name), { type: 'image/png' })
    try {
      await navigator.share({ files: [file], title: team.name })
    } catch {
      // Cancelled or unsupported: the download button still works.
    }
  }
  const canShare = state.status === 'ready' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([state.blob], 'x.png', { type: 'image/png' })] })

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Team poster"
      footer={
        <div className="flex flex-wrap items-center gap-3">
          {state.status === 'ready' ? (
            <a
              href={state.url}
              download={fileName(team.name)}
              className="inline-flex h-11 items-center rounded-full bg-red px-5 font-display text-[0.95rem] tracking-[0.04em] text-white uppercase hover:bg-red-bright"
            >
              Download PNG
            </a>
          ) : null}
          {canShare ? (
            <Button variant="ghost" onClick={() => void share()}>
              Share
            </Button>
          ) : null}
          <span className="font-mono text-[0.65rem] tracking-[0.12em] text-mute uppercase">
            {POSTER_WIDTH} × {POSTER_HEIGHT} px · for personal, non-commercial use
          </span>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
        {state.status === 'rendering' ? (
          <div role="status" className="flex aspect-[4/5] w-full items-center justify-center bg-void-raised font-mono text-xs tracking-[0.14em] text-mute uppercase">
            Printing…
          </div>
        ) : null}
        {state.status === 'ready' ? (
          <img
            src={state.url}
            alt={`Poster for ${team.name}: ${team.members.map((m) => m.name).join(', ')}`}
            className="w-full shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
          />
        ) : null}
        {state.status === 'error' ? (
          <p role="alert" className="text-red-bright">
            {state.message}
          </p>
        ) : null}
      </div>
    </Sheet>
  )
}
