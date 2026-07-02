# EDM Infographics

## What this is
A Next.js gallery site for hosting EDM (Electronic Direct Mail) infographics.
Static for now, deliberately: infographics are hardcoded in
`src/data/infographics.ts` (id, title, description, image path, pixel
dimensions) and images live in `public/`. Adding a new infographic means
adding one entry to that file plus the image — no database, no admin panel.

## Architecture decision: static-for-now, room to grow (2026-07-02)
Two requirements were discussed but deliberately deferred: non-technical
people uploading infographics without a code change, and persistent
forms/search/analytics data. Both need a database, and Airbase (the target
host) has no managed database yet — only bring-your-own via `DATABASE_URL`.
Rather than standing up external storage now, the site started static.

Next.js was chosen specifically because it doesn't force an all-or-nothing
choice: static pages and server-side logic (API routes) can coexist in the
same project. When a database is available (Airbase adds one, or an
external one is wired in), the CMS/forms features can be added as new API
routes without a framework migration.

## Pages
- `/` — gallery grid of all infographics (`src/app/page.tsx`)
- `/infographics/[id]` — detail page per infographic, with its own
  `generateMetadata` (title/description/OG image) for link-sharing
- `src/app/icon.tsx` — generated favicon (text monogram, no image asset)

## Deployment — Airbase (Docker, Node.js)
Follows Airbase's documented Next.js Dockerfile pattern exactly (from
`docs.app.tc1.airbase.sg/how-to/deploy-nodejs/`) rather than Next's own
`output: "standalone"` convention, since Airbase has a specific documented
example for this — deviating risked missing an Airbase-specific
requirement.

### Key files
- **`Dockerfile`** — multi-stage: `gdssingapore/airbase:node-22-builder`
  (has npm/build tooling) for `npm ci` + `npm run build`, then
  `gdssingapore/airbase:node-22` (leaner) as the runtime stage, copying
  over only `.next`, `node_modules`, `package.json`, `public`. Unlike the
  O2 Data Analytics (Python) project, this multi-stage split is a genuine
  size win — Airbase actually ships a `-builder` variant for Node, unlike
  Python.
- **`airbase.json`** — `handle: "fbi-dbe/edm-infographics"` (same team as
  O2 Data Analytics, `fbi-dbe`) — **unconfirmed**, this project may need
  to be created in the Airbase Console before the first `airbase deploy`
  succeeds, same as any new project handle.
- **`package.json`** `start` script is
  `next start -p ${PORT:-3000} -H 0.0.0.0` (not plain `next start`) — binds
  to all interfaces and Airbase's injected `$PORT`, per Airbase's Node.js
  guide.

### `metadataBase` / `NEXT_PUBLIC_SITE_URL`
`next build` warns if `metadataBase` isn't set in the root layout's
metadata — without it, Open Graph image URLs resolve against
`localhost` even in production, breaking link previews. Fixed by reading
`NEXT_PUBLIC_SITE_URL` in `src/app/layout.tsx`, defaulting to
`http://localhost:3000` for local dev. **Once deployed, set
`NEXT_PUBLIC_SITE_URL` to the real Airbase URL** (via `.env`, injected by
the Airbase CLI same as O2's `GEMINI_API_KEY` pattern) — until then, OG
previews will point at the wrong domain.

### Verified locally before first real deploy
`docker build` + `docker run` tested directly (not just `next build`) —
both `/` and `/infographics/[id]` returned HTTP 200 from inside the
container. Not yet actually deployed to Airbase itself (no Console
project confirmed, no live URL yet).

## Tech stack
- **Next.js 16** (App Router, Turbopack, TypeScript) — scaffolded via
  `create-next-app`; this version's docs live in
  `node_modules/next/dist/docs/` and differ meaningfully from older
  Next.js knowledge (e.g. `PageProps`/`LayoutProps` helper types,
  `proxy.ts` instead of `middleware.ts`, async `params` as a `Promise`)
- **Tailwind CSS v4**
- No database, no external API calls yet

## Run
```bash
npm run dev
```
Serves at `http://localhost:3000`.

## Adding a new infographic
1. Drop the image file in `public/`
2. Add an entry to `src/data/infographics.ts` with its `id`, `title`,
   `description`, `src` (the `public/`-relative path), and pixel
   `width`/`height` (needed for correct aspect-ratio rendering before the
   image loads)
