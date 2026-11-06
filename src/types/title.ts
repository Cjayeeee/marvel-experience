/** Domain types for films and series (curated catalogue + OMDb details). */

export type TitleKind = 'film' | 'series'

/** How a title's chronological position is known. */
export type Placement =
  /** Position in Disney+'s official "Timeline order", set by Marvel Studios. */
  | 'official'
  /** Not in the Disney+ timeline (e.g. Sony releases); placed by common fan consensus. */
  | 'fan'

export type Title = {
  /** Stable slug used in URLs, e.g. "avengers-endgame". */
  id: string
  title: string
  kind: TitleKind
  /** US release / premiere date, ISO "YYYY-MM-DD". */
  releaseDate: string
  /** True for announced titles that haven't been released yet. */
  scheduled?: boolean
  /** MCU phase 1–6; null for Marvel Television's Netflix series. */
  phase: number | null
  /** 1-based position in chronological (story) order; null when not placed. */
  chronoIndex: number | null
  placement: Placement | null
  /** Short note shown with fan placements or special cases. */
  note?: string
  /** IMDb id for OMDb lookups; null when not confirmed (looked up by title instead). */
  imdbId: string | null
}

/** Normalised subset of an OMDb response. */
export type TitleDetails = {
  imdbId: string
  title: string
  year: string
  rated: string | null
  released: string | null
  runtime: string | null
  genres: string[]
  directors: string[]
  writers: string[]
  actors: string[]
  plot: string | null
  poster: string | null
  ratings: { source: string; value: string }[]
  imdbRating: string | null
  awards: string | null
  boxOffice: string | null
  totalSeasons: string | null
}
