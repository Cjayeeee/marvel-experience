# MARVEL: MULTIVERSE

_Every Universe. Every Hero. Every Possibility._

An unofficial, non-commercial Marvel fan platform. It is not affiliated with Marvel Entertainment or The Walt Disney Company.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run preview   # serve the production build (no /api: use dev for OMDb)
npm run lint
npm test          # unit tests (Vitest)
```

You need Node 20.19+ or 22.12+ (required by Vite 8).

### OMDb key (posters, plots, ratings)

The key stays on the server. The browser asks the site's own `/api/omdb` function (`api/omdb.ts`), and that function
adds the key and calls OMDb.

**Locally:** copy `.env.example` to `.env.local`, set `OMDB_API_KEY=your-key`, and restart `npm run dev`.
The dev server runs the same function as Vercel does (see `vite.config.ts`).

**On Vercel:** go to Project → Settings → Environment Variables, add `OMDB_API_KEY` (type *Secret*), then redeploy.
Don't use a `VITE_` prefix: those are bundled into the public JavaScript.

The function only accepts ids from the curated catalogue (`/api/omdb?id=avengers-endgame`), so it can't be used for
other lookups that would burn the quota. Answers are cached by Vercel's CDN for a week and shared by every visitor, and
each browser caches them for a week too. With 57 titles, the free tier's 1,000 requests a day is never a concern.
Without a key the site still works: posters fall back to placeholders and a notice says what to set.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · Zustand ·
GSAP (ScrollTrigger, SplitText, Flip) · Lenis · Three.js + React Three Fiber · TanStack Query · Vitest.
No database or accounts for now: personal data lives in the browser (see *Your library*).

## Motion & 3D

- **Intro** (`src/features/intro`): plays on every full load of `/`, including reloads, but not when navigating back to it inside the site.
  Add `?intro=1` to any URL to replay it. It's skipped for reduced-motion users.
  Words never cut faster than ~2.7 per second, staying under the WCAG 2.3.1 limit of 3 flashes per second.
- **Hero portal** (`src/three`): three.js loads lazily, only on devices that pass
  `getRenderTier()`. Everything else gets the static CSS sphere. Rendering stops when the
  hero is off screen or the tab is hidden.
- **Scroll**: Lenis smooth scroll runs on GSAP's ticker. Add `data-reveal="heading" | "up" | "stagger"`
  to an element inside a page that calls `useReveals()` to get scroll reveals.
- **Reduced motion**: no intro, no smooth scroll, no pinning or scrubbing, and no WebGL.
  All content is visible without animation.

## Structure

```
api/              Vercel Functions (OMDb proxy), also served by `npm run dev`
scripts/          one-off asset generators
src/
  app/            router, root layout, error + loading states
  components/
    brand/        OrbitMark, Wordmark (original, not Marvel's logo)
    layout/       SiteHeader, MobileMenu, SiteFooter
    ui/           Button, Typography, Container, ArtworkSlot, Marquee
  config/         navigation
  data/curated/   hand-written content (the seed data if a database is added)
  lib/            small helpers
  features/intro/ opening title sequence
  motion/         GSAP setup, smooth scroll, reveals, route transition, tokens
  services/       data access: characters, universes, titles, OMDb, library/
  pages/          one folder per route (lazy-loaded)
    home/sections one file per homepage section
    stubs/        placeholders for pages built in later milestones
  stores/         Zustand stores
  styles/         Tailwind entry + design tokens (@theme)
  three/          3D scenes and their static fallbacks
```

## Data

- **Characters**: `src/data/curated/characters.ts`. There are 60 hand-written files, with biographies written for this project and
  first appearances, performers and years taken from public record. Marvel retired its public API in late 2025, so
  there is no live source.
- **Service layer**: components never read data files directly. They call `src/services/*.service.ts`
  through TanStack Query hooks (`src/features/*/queries.ts`), so changing the source later doesn't touch the UI.
- **Character artwork**: put images in `src/assets/characters/`, named by slug (for example `iron-man.webp`).
  They're picked up automatically. The build (vite-imagetools) ships two WebP copies of each, cropped to 3:4 from
  the top: 420 px for cards and 720 px for large portraits. The originals are never modified or shipped. `src/assets/characters/README.md` lists every slug. Characters with no image,
  or whose image fails to load, show the styled monogram placeholder.
- **Films & series**: `src/data/curated/titles.ts` holds 57 MCU and Marvel-studio titles with release dates,
  phases, IMDb ids and Disney+ "Timeline order" positions. Sony Spider-Verse titles have no official placement,
  so they're marked as fan placement. Posters, plots, credits and ratings come live from
  [OMDb](https://www.omdbapi.com/) (CC BY-NC 4.0) through `api/omdb.ts` and `src/services/omdb.service.ts`. OMDb has no trailers,
  so the site links to a YouTube search for each one.
- **Explorer state** lives in the URL (`/characters?q=&filter=&team=&universe=&sort=`), so every view can be
  shared and the back button restores it.

## Your library (favourites, watchlist, teams)

There are no accounts. Favourites, the watchlist and saved teams are kept in the visitor's browser
(`localStorage`, key `mm:library:v1`), stay in sync across open tabs, and can be exported to a JSON file and
imported elsewhere (merge or replace).

- `src/types/library.ts`: the data shape, one-to-one with future `favourites`, `watchlist` and `teams` tables.
- `src/services/library/schema.ts`: validation, merging, export/import. Unknown ids and bad entries are dropped.
- `src/services/library/libraryStore.ts`: the store. Changes apply instantly and are saved through an adapter.
  Nothing is saved until stored data has been read, so a slow load can't overwrite it.
- `src/services/library/adapter.ts`: the storage interface. `localAdapter.ts` implements it for the browser.
- `src/features/library/useLibrary.ts`: hooks for pages (`useIsFavourite`, `useWatchStatus`, `libraryActions`).

**Adding a database later** (e.g. Supabase): write a `supabaseAdapter` with the same three methods, swap it in
`src/services/library/index.ts`, add sign-in pages, and use `importText(..., 'merge')` to upload a visitor's
browser library into their new account. Keep row-level security on every table, and keep service keys in
server functions only.

## Arena & team builder

- **Ratings** (`src/data/curated/ratings.ts`): six attributes (intelligence, strength, speed, durability, energy,
  fighting) on a 1–7 scale in the style of the Official Handbook power grid. They are **this project's editorial
  estimates, not official figures**, and the UI says so wherever they appear. A test checks every character is rated.
- **Arena** (`/arena?a=&b=`): two characters side by side, with per-attribute edges and totals. It compares ratings,
  and doesn't simulate a fight. The URL holds the matchup, so it can be shared.
- **Team builder** (`/team-builder`): up to six members, a leader and a role each (Powerhouse, Tactician, Scout,
  Blaster, Brawler, Wildcard; suggested from ratings). Teams save to My archive (`?edit=<id>` reopens one) and share
  as links (`?n=Name&m=thor.powerhouse,loki.blaster&l=loki`).
- **Poster** (`src/features/teams/poster.ts`): a 1080×1350 PNG drawn on a canvas in the browser. It loads only when
  someone asks for one.

## Quality checks

- `npm test`: unit tests for the library store, import/export, share links, role suggestions and ratings coverage.
- **Accessibility**: axe-core (WCAG 2.2 AA + best practices) runs clean on every route, desktop and mobile. The one
  remaining report, header colour contrast, is a false positive: the header uses `mix-blend-difference`, which
  axe can't evaluate. Its real contrast is 14:1 on paper and 16:1 on the dark sections.
- **Lighthouse** (production build): desktop scores 97–100 on every page. Mobile scores 89–100 everywhere except
  the homepage (about 67), whose intro holds back the main content by design. Layout shift is under 0.1 everywhere.
- **Earth texture**: from [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). It was adapted: packed into land/cloud channels
  (`earth-packed.webp`) and rendered as a halftone horizon (`earth-horizon.webp`, `og.jpg`). The credit is in the footer.
- **Analytics**: Vercel Web Analytics (`<Analytics />` in `src/app/RootLayout.tsx`). Turn it on in the Vercel
  dashboard (project → Analytics → Enable), then redeploy. It's cookieless and counts client-side route changes
  as page views. It sends nothing in local development.
- **Link previews**: `public/og.jpg` (1200×630). `%SITE_URL%` in `index.html` is filled in at build time from
  `SITE_URL` or Vercel's production domain.

## Design tokens

| Token | Value | Role |
|---|---|---|
| `paper` | #EEE6D8 | light "dossier" surfaces |
| `void` | #121011 | dark surfaces |
| `ink` | #0A0A0A | text on paper |
| `red` | #E62429 | the single UI accent |
| `gold` | #C9A44C | rare highlights |
| `portal-violet` / `portal-cyan` | | 3D scenes only |

Fonts: **Anton** (display), **Inter Tight** (body), **JetBrains Mono** (labels). All are self-hosted via Fontsource.

## Deploy

`vercel.json` rewrites every path except `/api/*` to `index.html`, so deep links work on Vercel.
Set `OMDB_API_KEY` in the project's environment variables (see above).
