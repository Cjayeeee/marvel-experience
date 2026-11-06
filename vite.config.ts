import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { imagetools } from 'vite-imagetools'
import { characters } from './src/data/curated/characters.ts'
import { titles } from './src/data/curated/titles.ts'

/**
 * Serves the Vercel Functions in /api during `npm run dev`,
 * so the OMDb proxy works locally exactly as it does on Vercel. Only GET
 * handlers are wired up, which is all the site uses.
 */
function vercelApi(): Plugin {
  const routes: Record<string, string> = { '/api/omdb': '/api/omdb.ts' }
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        const file = routes[path]
        if (!file || req.method !== 'GET') return next()
        try {
          const mod = (await server.ssrLoadModule(file)) as { GET: (r: Request) => Promise<Response> }
          const response = await mod.GET(new Request(new URL(req.url ?? '/', 'http://localhost')))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

/**
 * Fills %SITE_URL% in index.html (link-preview tags need absolute URLs).
 * Uses SITE_URL if set, else Vercel's production domain, else nothing (relative URLs).
 */
function siteUrl(url: string): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url.replace(/\/$/, '')),
  }
}

/**
 * Writes robots.txt, plus sitemap.xml when the site's address is known
 * (sitemaps need absolute URLs). Lists every public page; /me is personal
 * and left out.
 */
function seoFiles(url: string): Plugin {
  const base = url.replace(/\/$/, '')
  const pages = [
    '/',
    '/characters',
    '/multiverse',
    '/movies',
    '/series',
    '/timeline',
    '/arena',
    '/team-builder',
    ...characters.map((c) => `/characters/${c.slug}`),
    ...titles.map((t) => `/titles/${t.id}`),
  ]
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${base ? `\nSitemap: ${base}/sitemap.xml\n` : ''}`,
      })
      if (!base) return
      const urls = pages.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Server-only variables (no VITE_ prefix) for the local API: never bundled.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OMDB_API_KEY && !process.env.OMDB_API_KEY) process.env.OMDB_API_KEY = env.OMDB_API_KEY
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const site = env.SITE_URL || (vercelDomain ? `https://${vercelDomain}` : '')

  return {
    // imagetools builds resized WebP copies of character art (see src/data/curated/artwork.ts).
    plugins: [react(), tailwindcss(), imagetools(), vercelApi(), siteUrl(site), seoFiles(site)],
    build: {
      // three.js is ~250 kB gzipped on its own; it is lazy-loaded only for the
      // hero portal on capable devices, so the default 500 kB warning is noise.
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
