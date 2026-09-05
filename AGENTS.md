# Cue

A personal tracker for movies, TV shows and anime — what you want to watch, are
watching, and have watched, alone or with specific people. Cue is not where you
watch; it is where you keep track of what you watch.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Postgres.

## How we work

**This is a learning project.** The owner is building their first Next.js app and
is deliberately learning server components, client components and SSR along the
way. Shipping fast is not the goal; understanding is.

1. **Never implement anything that was not explicitly asked for.** Propose, then
   wait. Writing unrequested code — even good code, even a small scaffold — is
   the single thing to avoid here.
2. **Default mode is explain-then-they-write.** Explain the concept, what the
   file needs to do, and the gotchas. The owner writes the code. Then review it.
   Only write code directly when asked to in that message.
3. **One file at a time.** Finish it, explain it, stop. Do not continue to the
   next file without being asked.
4. **Explain the why**, especially around the server/client boundary — that is
   the thing being learned, not just the thing being built.
5. **Verify before asserting.** This Next.js and Tailwind are both newer than
   training data. Read `node_modules/next/dist/docs/` and check installed
   package versions rather than recalling API shapes.

## Decisions already made

- **Full-stack Next.js, not a separate backend.** Server Components read the DB
  directly; Server Actions handle writes. V1 has no background jobs, websockets
  or queues, so a dedicated server would add CORS, two deploys and a client
  fetch waterfall while removing the reason to use Next.js at all.
- **Escape hatch kept open:** all SQL lives in `lib/db/` as plain functions with
  **zero Next.js imports**. If a dedicated server is ever needed, that folder
  lifts out into Hono/Express unchanged. Enforce this rule.
- **Railway + Railway Postgres** for deployment. Services in one Railway project
  share a private network, so the app↔DB hop is sub-millisecond and free. (Vercel
  + Neon is the $0 alternative but has no private networking and is
  non-commercial on Hobby.) Develop locally; deploy later.
- **Tailwind v4** for styling, not CSS Modules. Design tokens live in `@theme`
  in `app/globals.css`.

## Project structure

One rule per directory:

| Directory | Holds | Rule |
|---|---|---|
| `app/` | routes only | if a file is here, it is a URL — and it sits in a group |
| `components/` | presentational UI | must not touch the database |
| `actions/` | `'use server'` mutations | thin: auth → validate → call `lib/db` → revalidate |
| `lib/db/` | all SQL | **zero Next.js imports** |
| `lib/tmdb/` | external media API | server-only; the key never reaches the client — see `claude/docs/tmdb-api.md` |

**Every route lives in a group, and the group is the auth posture.** There are
two, and a route belongs to exactly one:

| Group | Chrome | Session | Holds |
|---|---|---|---|
| `(public)` | none | never read | the landing, `/signin`, `/signup` |
| `(app)` | top bar | required — the layout awaits it and redirects | everything you need an account to see |

Membership *is* the rule: you cannot add an ungated page under `(app)`, and
nothing in `(public)` may read the session, because that is what keeps those
routes statically prerenderable. Name groups for the posture, never `(routes)` —
everything under `app/` is routes.

```
app/
  layout.tsx              html, fonts, metadata, Splash — no chrome
  not-found.tsx           404, bare root only
  (public)/
    page.tsx              /                  landing
    (auth)/
      layout.tsx          the centred card
      signin/             /signin
      signup/             /signup
  (app)/
    layout.tsx            top bar + session gate
    home/                 /home              Home
    library/              /library           My Library
    title/[id]/           /title/:id         Media page
    people/               /people            People
    people/[personId]/    /people/:id        Shared list
    profile/              /profile
```

## Conventions

- **Server by default.** Pages and layouts are never marked `'use client'`.
  Push the directive down to the smallest interactive leaf — an active nav link,
  a drawer toggle, a rating star. A page that needs one interactive button does
  not become a Client Component.
- `params` and `searchParams` are Promises — `await` them.
- `PageProps<'/route'>` and `LayoutProps<'/route'>` are global helpers generated
  by `next dev` / `next build`. No import needed.
- Styling comes from tokens, not literals. Reach for `bg-bg-2`, `text-mut`,
  `border-line`, `px-pad` rather than arbitrary values.
- We always make reusable components everything, we check the whole codebase before creating a new component and if we find a similar component we use that instead and if we find an older component which can be made into a resuable component we update that and then use that. 

## Loading states

**Every new component or feature declares which of the three loaders it uses.**
Decide this when the component is designed, not after it feels slow. Sources live
in `claude/prototype/loaders/`.

| Loader | Use for | Cue mechanism |
|---|---|---|
| **Splash** | the cold first load of a session, once per browser | client curtain, `localStorage`-gated; **never** gates server-rendered HTML |
| **Shell** | an area that renders now but whose content resolves later | `<Suspense>` with a skeleton fallback |
| **RouteLoad** | moving between routes | top hairline + destination chip + veil over the outgoing view |

- **A Shell skeleton must match the real element's box** — same width, height and
  radius. A fallback that reserves the wrong space swaps a spinner for a layout
  shift, which is worse. This is why the top bar needs one at all: the left side
  is server-rendered instantly, the right side waits on the session.
- **A route change uses two loaders together.** RouteLoad says *where you are
  going*; the destination's `loading.tsx` skeleton says *what will be there*.
- **Splash is only ever the first paint of a cold session.** Never for data
  fetches, never for navigation.

## Prototypes

**Every standalone `.html`, `.js` or `.css` file goes in
`claude/prototype/<feature>/`.** Nothing else. If you are asked to mock something
up, sketch an interaction, or unpack a bundle to read it, that is where it lands —
one directory per feature, named for the feature.

`claude/prototype/` is gitignored. It is reference material and scratch space: it
is read to understand a design, and ported into `app/` and `components/` by hand.
It never ships, is never imported by application code, and no build step touches
it. Vanilla JS and plain CSS there are fine — that is the point of it. Real work
is TypeScript, React and Tailwind under the directories in the table above.

## Where things live

- `claude/docs/tmdb-api.md` — **read this before writing or changing anything
  that touches TMDB.** Auth, the full error-code table, rate limiting, caching,
  pagination limits, which endpoints carry `media_type`, `append_to_response`,
  trailers and their measured coverage, image sizes and URL building, languages,
  regions, changes, and the attribution we owe them. Claims are marked **[live]** (verified against the real API) or
  **[docs]**; **[live]** wins.
- `claude/prototype/website/` — the original design prototype, unpacked.
  **Read this, not `website.html`, which is the bundle.**
  - `js/01-toast.js` … `js/18-boot.js` — 18 modules in load order. State model is
    in `03-state.js`, the views in `05-`…`10-`, TMDB adapter in `17-`.
  - `css/all.css` — the full original design system.
  - `shell.html` — top bar, footer and palette markup.
- `claude/prototype/loaders/` — the loader prototype, unpacked.
  **Read this, not `loader.html`, which is the bundle.**
  - `js/splash.js`, `js/shell.js`, `js/route-loader.js` — the three loaders.
  - `css/splash.css`, `css/shell.css`, `css/route-loader.css` — their styles.
  - `demo.html` — the prototype page showing all three.
- `app/globals.css` — the live design system: `@theme` tokens (surfaces, text,
  gold, scrims, type, radii, motion, breakpoints), `@layer base` element
  defaults, and the `mono` / `sweep` / `no-scrollbar` utilities.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
