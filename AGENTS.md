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
| `app/` | routes only | if a file is here, it is a URL |
| `components/` | presentational UI | must not touch the database |
| `actions/` | `'use server'` mutations | thin: auth → validate → call `lib/db` → revalidate |
| `lib/db/` | all SQL | **zero Next.js imports** |
| `lib/tmdb/` | external media API | server-only; the key never reaches the client |

```
app/
  layout.tsx            root shell (top bar + footer)
  page.tsx              /                  Home
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

## Where things live

- `claude/docs/website.html` — the original design prototype (a bundled
  vanilla-JS SPA; not readable directly).
- `claude/docs/prototype/` — that bundle unpacked. **Read this, not the HTML.**
  - `js/01-toast.js` … `js/18-boot.js` — 18 modules in load order. State model is
    in `03-state.js`, the views in `05-`…`10-`, TMDB adapter in `17-`.
  - `css/all.css` — the full original design system.
  - `shell.html` — top bar, footer and palette markup.
- `app/globals.css` — the live design system: `@theme` tokens (surfaces, text,
  gold, scrims, type, radii, motion, breakpoints), `@layer base` element
  defaults, and the `mono` / `no-scrollbar` utilities.

The prototype is **reference, not truth.** It stores per-user state in
`localStorage` and asks the user to paste their own TMDB key — both workarounds
for having no server. Don't port those.


