# MARVEL: MULTIVERSE

_Every Universe. Every Hero. Every Possibility._

An unofficial, non-commercial Marvel fan platform. It is not affiliated with Marvel Entertainment or The Walt Disney Company.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run lint
```

You need Node 20.19+ or 22.12+ (required by Vite 8).

### OMDb key (posters, plots, ratings)

1. Copy `.env.example` to `.env.local` in the project root.
2. Put your key in it: `VITE_OMDB_API_KEY=your-key`.
3. Restart `npm run dev`, because Vite only reads env files at startup.

`.env.local` is gitignored, so never commit it. Without a key the site still works: posters fall back to placeholders
and a notice explains why. The free OMDb tier allows 1,000 requests a day. Responses are cached in
`localStorage` for 7 days, and posters load only when they scroll into view.
A `VITE_` variable is bundled into the client, so in Milestone 6 the key moves behind a Supabase Edge Function.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · Zustand ·
GSAP (ScrollTrigger, SplitText) · Lenis · Three.js + React Three Fiber.
Supabase is added in Milestone 6.

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
src/
  app/            router, root layout, error + loading states
  components/
    brand/        OrbitMark, Wordmark (original — not Marvel's logo)
    layout/       SiteHeader, MobileMenu, SiteFooter
    ui/           Button, Typography, Container, ArtworkSlot, Marquee
  config/         navigation
  data/curated/   hand-written content (replaced by Supabase services later)
  lib/            small helpers
  features/intro/ opening title sequence
  motion/         GSAP setup, smooth scroll, reveals, route transition, tokens
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
  there is no live source. Supabase replaces this file in Milestone 6, and this list becomes its starting data.
- **Service layer**: components never read data files directly. They call `src/services/*.service.ts`
  through TanStack Query hooks (`src/features/*/queries.ts`), so changing the source later doesn't touch the UI.
- **Character artwork**: put images in `src/assets/characters/`, named by slug (for example `iron-man.webp`).
  They're picked up automatically. `src/assets/characters/README.md` lists every slug. Characters with no image,
  or whose image fails to load, show the styled monogram placeholder.
- **Films & series**: `src/data/curated/titles.ts` holds 57 MCU and Marvel-studio titles with release dates,
  phases, IMDb ids and Disney+ "Timeline order" positions. Sony Spider-Verse titles have no official placement,
  so they're marked as fan placement. Posters, plots, credits and ratings come live from
  [OMDb](https://www.omdbapi.com/) (CC BY-NC 4.0) through `src/services/omdb.service.ts`. OMDb has no trailers,
  so the site links to a YouTube search for each one.
- **Explorer state** lives in the URL (`/characters?q=&filter=&team=&universe=&sort=`), so every view can be
  shared and the back button restores it.

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

`vercel.json` rewrites every path to `index.html` so deep links work on Vercel.
