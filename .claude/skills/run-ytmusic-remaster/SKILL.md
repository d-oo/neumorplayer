---
name: run-ytmusic-remaster
description: Build, run, and screenshot the ytmusic-remaster web app (Vite + React SPA). Use when asked to start ytmusic-remaster, run its dev server, take a screenshot of a page (e.g. /login, /signup), or verify a frontend change actually renders.
---

Vite + React SPA. Driven headlessly via `driver.mjs` in this same
directory, which launches the dev server and drives a real Chromium
through the project's own `playwright` devDependency (this machine has
no `chromium-cli` installed, so that's the fallback used instead).

All paths below are relative to the project root (the folder
containing `package.json`).

## Prerequisites

Verified on this machine: Windows, Git Bash, Node v24.15.0. No OS
packages were needed — `playwright`'s bundled Chromium runs on Windows
without the Linux `apt-get` dance.

```bash
npm install                    # installs playwright too (devDependency)
npx playwright install chromium   # no-op if already cached; quick either way
```

## Setup

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. For a
pure UI check (screenshotting `/login`, `/signup`, layout work) these
just need to be **non-empty strings** — `src/lib/supabase.ts` throws at
module load if either is empty, which blanks the *entire* app (every
route, not just Supabase-dependent ones) because `AuthProvider` is
mounted at the root in `src/main.tsx`. Real Supabase values are only
needed to actually exercise login.

## Build

Not needed to drive the dev server. `npm run build` (`tsc -b` + `vite
build`) is the project's own production-build check — run it after
code changes, separately from this driver.

## Run (agent path)

```bash
node .claude/skills/run-ytmusic-remaster/driver.mjs login signup
```

- If port 5173 already responds (e.g. you have `npm run dev` open in
  your own terminal), the driver **reuses it as-is** — it does not
  touch it and does not kill it afterward. Only when nothing answers on
  5173 does it spawn its own `npm run dev` — and only in that case does
  it free the port again on exit. It never kills a server it didn't
  start itself.
- For each argument it then visits `http://localhost:5173/<arg>`, waits
  for network-idle, and screenshots it.
- **Pass route names without a leading slash** (`login`, not `/login`)
  — see Gotchas below for why.
- No arguments defaults to `login signup`.
- Screenshots land in `.claude/skills/run-ytmusic-remaster/screenshots/<route>.png`.
- When it spawns its own server, output is captured to
  `.claude/skills/run-ytmusic-remaster/dev-server.log`.
- Prints any browser console errors/pageerrors it captured and exits
  non-zero if there were any.

To check a route this skill doesn't already know about, just add it as
an argument — no code change needed for a plain page visit + screenshot.

## Run (human path)

```bash
npm run dev
```

Opens the Vite dev server; visit `http://localhost:5173/login` yourself.
Ctrl-C to stop. `/api/*` routes are **not** served this way (see
Gotchas) — this skill doesn't cover verifying those.

## Test

```bash
npm run build   # type-checks src/, api/, vite.config.ts and bundles
npm run lint    # eslint .
```

No unit test runner is configured in this project. These two commands
are the actual verification surface.

---

## Gotchas

- **Earlier version of this driver always killed whatever was on port
  5173, including a dev server you'd started yourself by hand.** It
  did an unconditional pre-kill before spawning and an unconditional
  kill in its `finally` block. Fixed to check first (`waitForServer`
  with a short 1s timeout) and only spawn/kill a server it started
  itself. If you're modifying this driver, preserve that check — don't
  reintroduce an unconditional `freePort` at the top of `main()`.
- **Git Bash (MSYS) rewrites leading-slash arguments.** Running
  `node driver.mjs /login` from Git Bash silently turns `/login` into
  something like `C:/Program Files/Git/login` before Node ever sees it
  (MSYS's path-conversion heuristic misreads it as a Unix absolute
  path). The driver works around this by taking route names **without**
  the leading slash and prepending it internally — always call it as
  `node driver.mjs login`, not `node driver.mjs /login`.
- **`.env.local` with empty values blanks the whole app, not just
  Supabase-dependent pages.** `AuthProvider` (mounted in `src/main.tsx`,
  above the router) imports `src/lib/supabase.ts` unconditionally, and
  that file throws if `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`
  are missing. A placeholder value is enough to boot; it doesn't need
  to be a real project unless you're actually testing login.
- **`/api/*` (the YouTube proxy functions) are invisible to `npm run
  dev`.** Vite's dev server has no idea `api/` exists — a page that
  calls `/api/youtube-search` will just 404 under this driver. That
  needs `vercel dev` instead, which this skill has not verified (not
  covered here — add a section if you get it working).
- **Spawning `npm` with `shell: true` and a separate args array logs a
  Node `DEP0190` deprecation warning** (arg-escaping concerns). The
  driver avoids it by passing the whole `npm run dev -- --port ...`
  invocation as one command string instead of `["run", "dev", ...]`.

## Troubleshooting

- **"Dev server never came up on http://localhost:5173"**: check
  `.claude/skills/run-ytmusic-remaster/dev-server.log` for the actual
  Vite error (usually a missing `.env.local` value or a port already
  held by a process the pre-kill couldn't see).
- **`page.goto: ... Cannot navigate to invalid URL
  "http://localhost:5173C:/Program Files/Git/..."`**: you (or a script)
  passed a leading-slash path on Git Bash outside the driver's own
  normalization — see the MSYS gotcha above.
