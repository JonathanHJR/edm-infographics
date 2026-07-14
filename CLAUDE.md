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

## Visual identity and accessibility (2026-07-02 to 2026-07-14)
Navy + gold identity pulled deliberately from the one infographic's own
colour scheme (not from any other project, and not a Vercel/O2 copy) —
`globals.css` defines `navy`/`navy-dark`/`accent`/`accent-light` theme
tokens. Dropped the separate OS dark-mode variant in favour of this single
intentional look.

**Contrast bug found and fixed**: the original accent gold (`#c9982e`) on
white background measured **2.62:1** — fails WCAG AA's 4.5:1 minimum for
text. Hit both the "Back to gallery" link and the download button's hover
state (white text on gold background, same ratio, same failure). Computed
actual contrast ratios rather than eyeballing it. Fixed with a separate,
darker `accent-dark` (`#8a6712`, 5.21:1) used specifically for text/button
contexts; kept the brighter `accent` for decorative/large elements
(borders, header underline) where contrast rules don't apply the same way.

**Keyboard focus states**: default was a barely-visible 1px browser
outline that didn't match the design at all. Added navy/gold
`focus-visible` rings across the header link, gallery cards, back-link,
and download button. The gallery card specifically needed `outline`
instead of `ring` (box-shadow-based) — it already has `shadow-sm`/
`hover:shadow-lg`, and a `focus-visible:ring-*` utility silently failed to
render at all alongside those (confirmed via computed styles, not just
visual inspection: the ring's box-shadow layers stayed at zero even though
the element correctly matched `:focus-visible`). `outline` is a separate
CSS property from `box-shadow`, so it doesn't hit the same conflict.
Required moving `overflow-hidden` off the card itself onto just its image
wrapper (`rounded-t-xl`), so the card's own outline isn't clipped.

**Layout width**: gallery/header/footer moved from `max-w-5xl` to
`max-w-7xl` (with `xl:grid-cols-4`) so the grid uses more of the screen on
wide monitors — a card grid benefits from more width, unlike body text.
Detail page deliberately stays narrower (`max-w-3xl`) for readable line
length and comfortable image viewing.

**Image loading bug fixed**: the detail page's `<Image>` had no `sizes`
prop, so Next.js assumed full-viewport display width and fetched a
3840px-wide/5.2MB variant even though the container caps display at
~720px. Adding `sizes="(min-width: 768px) 720px, 100vw"` dropped the
actual request to ~79KB (`w=750`) — this was the entire cause of a
reported slow load after clicking into an infographic, not a deeper
performance issue.

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
- **`airbase.json`** — `handle: "fbi-dbe/dbe-edm-infographics"` (same team
  as O2 Data Analytics, `fbi-dbe`). Confirmed via Airbase Console — the
  first deploy attempt with `fbi-dbe/edm-infographics` 404'd because the
  project didn't exist yet under that exact handle; Airbase doesn't
  auto-create projects from `airbase.json`, they must exist in Console
  first (project was created there as `dbe-edm-infographics`).
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

### Critical gotcha: stale cached Docker image on redeploy
After pushing a styling change and running `airbase deploy --yes`, the
deploy "succeeded" suspiciously fast and the live site showed **no
visual change at all** — even in incognito, ruling out browser caching.

Cause: `docker images` showed `local.airbase.sg/edm:<hash>` and
`registry.tc1.airbase.sg/fbi-dbe/dbe-edm-infographics:default` pointing
to the **same image ID**, left over from the first deploy. Airbase's CLI
reused that cached local image instead of rebuilding from the current
source — same root cause already documented in the O2 Data Analytics
project's `CLAUDE.md`. Not Dockerfile-specific: it recurs on any
redeploy where a same-tagged image already exists locally, even when
only app source (not the Dockerfile) changed.

**Fix** — delete the cached image by ID (removes all tags pointing to
it), then redeploy so a real `docker build` has to run:
```bash
docker images | findstr edm     # find the image ID
docker rmi -f <image-id>
airbase deploy --yes            # noticeably slower = it's actually rebuilding
```
A deploy that finishes suspiciously quickly after a code change is the
tell that this happened again.

### Verified locally before first real deploy
`docker build` + `docker run` tested directly (not just `next build`) —
both `/` and `/infographics/[id]` returned HTTP 200 from inside the
container. Since deployed live to Airbase (`dbe-edm-infographics`
project, `fbi-dbe` team) via `airbase deploy --yes`.

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
