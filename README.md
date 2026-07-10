# pfdebug

A 15-minute plantar-fasciitis self-check: a guided wizard runs a battery of
at-home movement tests, feeds the results through a deterministic decision
engine, and renders a personalized exercise plan. Not a diagnostic tool —
"your movement profile", never "diagnosis", with a hard red-flag referral
gate for safety.

Specs live in `docs/` (BUILD.md is the entry point). The engine implements
`docs/pfdebug-engine-spec.md` exactly and is regression-tested against the
8 persona fixtures.

## Stack

- **Astro 5** (static output, Cloudflare Pages) + one **Preact** island for
  the wizard and one for the plan page.
- **Engine**: pure, framework-agnostic TypeScript in `src/engine/` — zero
  DOM/framework imports, unit-tested in isolation.
- **State, no backend**: the result is encoded into the URL fragment
  (`/plan#v1.<lz-string>`) — fragments never reach servers or logs.
  localStorage holds only `pfdebug.units` and `pfdebug.lastResult`.
- Hand-rolled CSS on design tokens (tick-mark instrument aesthetic).

## Commands

| Command | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | static build to `dist/` |
| `npm test` | engine fixtures + codec/unit tests (Vitest) |
| `npm run check` | `astro check` (types) |
| `npm run smoke` | end-to-end pass on the built site (Playwright) |
| `npm run a11y` | axe-core WCAG AA audit + print-sheet budget |
| `npm run og` | regenerate the static OG card |

`smoke` and `a11y` need a build first (`npm run build`) and the
container's Chromium at `/opt/pw-browsers/chromium`.

## Layout

```
docs/                     specs (BUILD.md, engine spec, copy, fixtures rationale)
src/engine/               the decision engine + fixtures + tests
src/copy/copy.ts          every user-facing string, verbatim
src/lib/                  payload codec, units, storage, calibrator, share card
src/islands/wizard/       the assessment wizard island
src/islands/plan/         the /plan result renderer
src/pages/                /, /assessment, /plan
scripts/                  og + smoke + a11y tooling
```
