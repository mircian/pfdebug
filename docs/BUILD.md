# pfdebug.com — BUILD.md

**Mission:** build the plantar-fasciitis self-assessment *flow* — a guided wizard that runs a battery of at-home tests, feeds the results through a decision engine, and renders a personalized exercise plan. This is the core of pfdebug.com. Standalone SEO/content pages are a later milestone (see §9).

This file is the entry point. Read, in order:
1. **BUILD.md** (this file) — architecture, constraints, acceptance.
2. **pfdebug-engine-spec.md** — the decision logic, implementation-ready. Implement this exactly.
3. **pfdebug-personas.fixtures.json** — 8 input→output test cases. Your engine must pass all 8.
4. **pfdebug-copy.md** — every user-facing string, final. Use verbatim; don't rewrite.

Background (rationale and full design brief, not required to build but useful): the product plan doc, especially its §7 design brief for the full illustration/brand system.

---

## 1. Non-negotiables

- **Implement the engine in `pfdebug-engine-spec.md` exactly.** It's deterministic. All 8 fixtures must pass as automated tests before any UI work is considered done.
- **Copy is final.** Slot the strings from `pfdebug-copy.md` in verbatim, including the bracketed `[slots]` which get filled from the user's own values. Do not paraphrase or "improve" clinical/safety wording.
- **This is health-adjacent. It is not a diagnostic tool.** Framing throughout is "your movement profile" / "most likely contributor," never "diagnosis." The red-flag gate and referral pages exist for safety — never weaken or skip them.
- **No backend in v1.** No accounts, no database, no server-side user data. State lives in the URL fragment and localStorage only (§4).

## 2. Stack

- **Astro**, deployed to **Cloudflare Pages**. Static output; the assessment is a single interactive island.
- **Engine as a standalone, framework-agnostic TypeScript module** (`src/engine/`), pure functions, zero DOM/framework imports, so it's unit-testable in isolation against the fixtures. Everything else depends on it; it depends on nothing.
- Interactive island: your choice of Preact / React / Svelte / Vue via Astro integration. Keep it to one island for the wizard + results; the rest of the site is static Astro.
- **Vitest** (or equivalent) for the engine tests. Wire `pfdebug-personas.fixtures.json` in directly.
- No CSS framework required; hand-rolled CSS with custom properties for the tokens (§6) is fine and preferred for the instrument aesthetic. Tailwind is acceptable if you'd rather.
- Fonts via Google Fonts (all three are free): Bricolage Grotesque, Public Sans, IBM Plex Mono.

## 3. Routes

| Route | Renders |
|---|---|
| `/` | Landing. **Two states:** no saved result → intro + "Start the check" (evidence badges above the fold). Saved result in localStorage → "Welcome back" hero with *View my plan* / *Retest*. |
| `/assessment` | The wizard. One screen per question/test, Steps 0–4 (see engine spec + copy). Progress rendered as a filling ruler. `?mode=retest` pre-fills prior scores and shows deltas. |
| `/plan#<payload>` | **The canonical result page.** Profile summary + gauges + the exercise plan. The complete result is encoded in the fragment (§4). Finishing the assessment redirects here. This URL is the shareable/bookmarkable artifact. |
| `/tests/knee-to-wall`, `/tests/heel-raise`, `/tests/wet-footprint` | *(Later milestone)* standalone explainers, SEO. |
| `/exercises/*`, `/evidence`, `/when-to-see-a-doctor`, `/legal` | *(Later milestone)* content pages. `/when-to-see-a-doctor` is the red-flag page as a standalone resource. |

## 4. State model (get this right — it's the architecture)

Three tiers, no server:

- **URL fragment = source of truth for a result.** On finishing the assessment, encode the full engine input (or the input + computed result) to a compact string and put it after `#`: `/plan#v1.<payload>`. Use **lz-string** (`compressToEncodedURIComponent`) and a leading schema version tag (`v1.`) so the format can evolve. `/plan` reads the fragment, decodes, and renders. **Why the fragment and not a query param:** fragments are never sent to the server, never hit logs, never leak via `Referer`. This keeps a health result URL private by architecture. (Consequence: no server-rendered per-result OG image — that's intended; see §7 share.)
- **localStorage = convenience mirror + settings.**
  - `pfdebug.units` → `"metric" | "imperial"`, defaulted from browser locale on first visit.
  - `pfdebug.lastResult` → the last-viewed result payload (same string as the fragment), powering the returning-visitor landing state. Store the raw payload only; no analytics, no PII beyond the user's own test answers.
- **In-memory = wizard working state**, until the user reaches the result.

Round-trip requirement: encode → open the URL fresh → identical rendered plan. This is an acceptance test.

## 5. Units — one master switch, canonical metric

- A **metric/imperial segmented toggle pinned in the header on every screen**, including mid-wizard. One setting governs everything: cm↔in for distances, kg↔lb for exercise progression loads.
- **Store every value canonically in metric; convert only at display.** Never store the displayed/converted number back. This prevents rounding drift when the user toggles repeatedly. Thresholds convert for display too (10 cm shows as ~4 in).
- Persist to `pfdebug.units`. Toggling animates visible measurements in place (~200 ms).
- **Measurement helper** on the knee-to-wall step: primary input is a direct number in the active unit. Plus a "no tape measure?" calibrator: a `model → length_cm` map the user picks from ("my toe was 1 phone-length away"), with a credit-card fallback. Seed the map with **iPhone 15 Pro = 14.7 cm** and **credit/bank card = 8.56 cm** (ISO ID-1, universal); populate other phone models from official specs. The direct-number input must always be available as the primary path.

## 6. Design tokens (build-critical subset)

Full brand + illustration system is in the plan's §7 design brief. The minimum to build correctly:

**Identity:** the product is a measuring instrument; the visual motif is **measuring-tape tick marks.** Wordmark = `pfdebug` set lowercase in **IBM Plex Mono Medium** (the data face is the brand face). Progress bars, dividers, and result gauges are all built from tick marks, not plain rules.

**Color:**

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FAFAF7` | background |
| `--ink` | `#1F2E35` | text, outlines, illustration linework |
| `--ink-soft` | `#5C6B72` | secondary text, minor ticks, captions |
| `--mark` | `#0E7C6B` | links, buttons, "in range" gauge zones, illustration annotations |
| `--flag` | `#C08A2D` | "worth working on" gauge zones, borderline states (bands/fills, never alarm text) |
| `--tissue` | `#B8503E` | **illustrations only** — highlights the loaded/stretched structure (fascia, calf) |
| `--stop` | `#A6402F` | **the red-flag / referral page only.** Never a test-score color. |

**Semantics rule:** test results are never emergencies. Gauges use `--mark` (in range) and `--flag` (work on it) only. `--stop` (red) appears on exactly one page: the red-flag referral (D0). Keep red meaning "see a professional," never "bad score."

**Type:** Display = **Bricolage Grotesque** SemiBold. Body = **Public Sans** (17px / 1.6 — people read instructions at arm's length; err large). Data (every measurement, rep count, timer, gauge label) = **IBM Plex Mono** Medium, **tabular figures always.** Scale ratio 1.25. Measurement callouts 40–56px.

**Key components:**
- **Ruler gauge** (results): a horizontal ruler with zone bands beneath (`--mark` in range, `--flag` work-on-it), one pointer per side labelled L/R on the same scale, value in Plex Mono above each pointer, asymmetry % rendered between the two pointers. States: single value / L-R compare / retest delta.
- **Wizard progress** = a ruler filling left→right, minor/major ticks, current step as the tape pointer.
- **Buttons/inputs:** 2px `--ink` borders, 6px radius, **48px min touch targets** (people operate this one-legged, holding a phone).

**Illustrations:** flat vector, `--ink` 3px linework on `--paper`, one gender-neutral featureless figure reused everywhere, fixed camera per subject, annotations in `--mark`, loaded structure in `--tissue`. `prefers-reduced-motion` → static keyframes. Full spec in plan §7. If illustrations aren't ready at build time, ship labelled placeholder frames with the correct captions/alt text; the flow must not depend on final art.

## 7. Feature specifics

- **Returning visitor, stated out loud.** The end-of-assessment screen tells the user plainly that results are saved on this device, the plan URL is bookmarkable, and to open it elsewhere they should bookmark the link. (Copy in `pfdebug-copy.md`.) Silent persistence reads as surveillance; announced persistence reads as service.
- **Print** — a *Print my exercises* button on `/plan`, backed by a dedicated **print stylesheet** (not a screen dump). ≤2 pages (1 is the goal): the exercises with keyframes + doses + tempo, the user's own numbers, a blank "retest on: ____" line, and a **client-generated QR** linking back to the plan URL. Header carries the wordmark; footer carries a one-line "Know someone with morning heel pain? pfdebug.com."
- **Share — two distinct objects, kept separate in the UI:**
  1. *Share pfdebug* (the promote loop; default; **zero personal data**) — shares the `/assessment` landing. Framing is always help-someone-you-know, never help-us-grow. Appears **only after value is delivered**: end of the plan, after a retest improvement, and on the printed sheet. Uses `navigator.share` on mobile, copy-link + prewritten message on desktop. Prewritten copy in `pfdebug-copy.md`.
  2. *Share my plan* (utility; on `/plan` only) — shares the personal `#payload` URL, labelled "this link contains your results."
  - **OG:** one excellent **static** OG card for all shares (tick-mark identity + the 15-minute promise). Personalized sharing uses a **client-generated share card** (canvas → PNG of the ruler gauge + any retest delta) containing only what the user chooses to show. No per-result server OG (see §4).
- **Analytics:** privacy-light only (Plausible-class). **Must be configured to never capture URL fragments** — the fragment contains the user's result. A health tool full of trackers undermines its own trust story; keep it minimal.
- **Accessibility floor:** WCAG AA contrast (the token pairs pass on `--paper`); every illustration paired with full text instructions (visuals augment, never gatekeep); the unit switcher keyboard-operable and announced; `prefers-reduced-motion` honored on all keyframe animation; audio metronome (heel-raise test) **opt-in, off by default**.

## 8. Acceptance criteria

- ✅ All 8 fixtures in `pfdebug-personas.fixtures.json` pass as automated engine tests.
- ✅ Every route in §3 (core flow: `/`, `/assessment`, `/plan`) is reachable and renders.
- ✅ Every engine output route (D0, D0-soft, composed plan, D5, D4) is reachable via some real input path and renders the correct copy.
- ✅ Units persist across reload and convert with **no drift** on repeated toggling; thresholds display correctly in both systems.
- ✅ Result URL round-trips: finish assessment → copy `/plan#...` → open fresh → identical plan.
- ✅ Returning-visitor landing appears when `pfdebug.lastResult` exists.
- ✅ Print produces ≤2 pages with the user's values + a working QR to their plan.
- ✅ Both share objects work and are correctly scoped (share-pfdebug carries no personal data; share-my-plan carries the payload and says so).
- ✅ No console errors; Lighthouse accessibility ≥ 95 on `/assessment` and `/plan`.

## 9. Build order (logic first, so it self-verifies before any UI)

1. **Scaffold** Astro + Cloudflare Pages config. Set up the pure-TS engine module and Vitest. **Implement the engine to pass all 8 fixtures.** Do this before touching UI — a green suite means the hard part is correct.
2. **Wizard island** (Steps 0–4) wired to the engine. Fragment encode/decode (lz-string, `v1.` tag). localStorage for `pfdebug.units` and `pfdebug.lastResult`. Returning-visitor landing.
3. **`/plan` rendering** of all result pages from engine output, copy verbatim, ruler gauges, live unit switcher.
4. **Print stylesheet + QR**, then **share modules** (both objects, static OG, canvas share card).
5. **Accessibility pass** + analytics with fragment exclusion.
6. *(Later milestone)* standalone `/tests/*`, `/exercises/*`, `/evidence`, `/when-to-see-a-doctor`, `/legal`.

## 10. Explicitly out of scope for v1

Accounts; email/retest reminders (Phase 2 — the reminder deep-links to `?mode=retest`, which the wizard already supports); filmed step-down / movement-quality analysis; Romanian localization (keep strings centralized so it's easy later); insole affiliate links; per-result server-rendered OG images; any server-side storage of user data.

---

*One-line summary for the agent: build a static Astro flow whose brain is a deterministic, fixture-tested TS engine; keep all user data in the URL fragment + localStorage; render final copy verbatim over a tick-mark instrument aesthetic; never weaken the safety gates.*
