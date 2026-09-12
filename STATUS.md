# Orbit — Build Status

**Last updated:** 2026-09-12 — passport JPEG export (Codex)
**Phase:** M8 — full-stack on Neon Postgres; 24 students, zero-g graph, assistant
**Demo runnable:** ✅ end to end, verified by script
**Build passing:** ✅ `npm run verify`
**Demo path passing:** ✅ `npm run check:demo` — **15/15**

> Read `AGENTS.md` first for locked engineering decisions and product invariants.
> `Orbit-about.md` is the product spec and the source of truth.
> **Any agent working on this repo must update this file after each unit of work.**

---

## 1. Current state

Every item in the spec's Definition of Done (§23) is implemented **and verified
by an automated script**, not by eyeballing. The full demo — join → six
questions → passport → constellation → mission → dashed-to-solid → professor
dashboard → before/after belonging — runs without touching any data by hand.

Three verification layers, all green:

| Command | What it proves |
| --- | --- |
| `npm run typecheck` | No `any`, no type errors |
| `npm run check:logic` | Graph shape, determinism, explainability, layout spacing |
| `npm run check:demo` | The whole demo path in a real browser (needs `npm run dev`) |
| `npm run verify` | typecheck + check:logic + production build |

**Known-good numbers from `check:logic`:** 26 edges across 12 seeded students,
Abhi↔Maya is the strongest edge at 18.5 (the spec's demo story), Aisha is the
single sparse student with exactly 1 edge, minimum node separation 130px.

**Latest UX addition:** the passport reveal page now offers a browser-side
"Download my unique passport" export button that saves the currently created
passport as a self-contained HTML artifact.

## 2. Milestones

| # | Milestone | Status |
| --- | --- | --- |
| M0 | Scaffold + deps + agent docs | ✅ |
| M1 | Core domain logic + seed data + matching | ✅ |
| M2 | Design system + landing page | ✅ |
| M3 | Join → onboarding → passport flow | ✅ |
| M4 | Constellation graph + accessible list view | ✅ |
| M5 | Connection missions (dashed → solid) | ✅ |
| M6 | Professor dashboard + Bridge the Class + belonging pulse | ✅ |
| M7 | Demo reset, mobile polish, verification scripts | ✅ |
| M8 | Deploy to Vercel | ⬜ **awaiting go-ahead from Abhi** |

## 3. Definition of done (spec §23) — all verified by `npm run check:demo`

- [x] Professor can open the seeded classroom dashboard
- [x] New student can join with a code and answer six questions
- [x] Student receives a visually distinctive passport
- [x] Their node appears in the constellation
- [x] At least three explainable connections appear
- [x] Student can complete a connection mission
- [x] A suggested edge changes from dashed to solid
- [x] Professor view shows aggregate before/after belonging data
- [x] Full flow demoable in under 3 minutes with no manual data edits
- [x] Demo reset button works repeatably
- [x] Student can download both sides of their passport as high-resolution JPEGs
- [x] Onboarding includes a fictional test-student preset for fast demo setup

Extra invariants the script also asserts:
- [x] Every graph node is exactly the same pixel size
- [x] No per-student connection count appears on the professor dashboard
- [x] Zero console/page errors across the whole run

## 4. How to run

```bash
npm run dev          # http://localhost:3210  (port is PINNED — see decisions)
npm run verify       # typecheck + logic checks + production build
npm run check:demo   # end-to-end demo walk-through (dev server must be up)
```

**Demo class join code: `ORBIT7`**

## 5. File inventory

**Pure logic — no React, no browser APIs, runnable from Node:**

| File | Purpose |
| --- | --- |
| `lib/types.ts` | Domain types (spec §14); `MatchReason.direction` powers skill-exchange copy |
| `lib/questions.ts` | Controlled vocabularies + 12-question bank (6 core, 6 bonus, including movie and music genre prompts) |
| `lib/privacy.ts` | The only place deciding passport-visible vs match-usable |
| `lib/matching.ts` | `scorePair`, `buildConstellation`, `rankSuggestionsFor`, `explainReasons` |
| `lib/grouping.ts` | `bridgeTheClass` greedy grouping + rationale strings |
| `lib/missions.ts` | Templated conversation starters — deterministic, no LLM needed |
| `lib/db/schema.ts` | Drizzle schema mirroring `lib/types.ts` |
| `lib/db/repository.ts` | The only module that talks to the database |
| `lib/db/client.ts` | Lazy Neon client (eager init breaks `next build`) |
| `app/api/*` | state · students · connections · pulse · missions · reset · simulate |
| `lib/assistant.ts` | Grounded Q&A + assignment→groups. No model call, no API key. |
| `lib/physics.ts` | Zero-gravity spring simulation for the constellation |
| `lib/insights.ts` | Aggregate-only professor stats (deliberately has no "isolated students" function) |
| `lib/layout.ts` | Deterministic force layout for the constellation |
| `lib/passport.ts` | Deterministic passport visuals derived from student id |
| `lib/seed-data.ts` | The 12 fictional students, demo classroom, "before" pulse |

**Client:**

| File | Purpose |
| --- | --- |
| `lib/store.ts` | localStorage store via `useSyncExternalStore`; every action lives here |
| `app/page.tsx` | Landing — editorial sections + `components/ui/word-reveal.tsx` |
| `app/join`, `components/onboarding/join-form.tsx` | Join code |
| `app/onboarding`, `components/onboarding/onboarding-flow.tsx` | Question flow + chips |
| `app/passport`, `components/passport/*` | Passport card, orbital avatar, reveal |
| `app/constellation`, `components/constellation/*` | Graph, custom node/edge, legend, list view |
| `components/missions/mission-panel.tsx` | One mission at a time, skip is free |
| `app/professor/create`, `app/professor/dashboard`, `components/dashboard/*` | Professor side |
| `components/ui/*` | Primitives, header (wordmark only), hero graphic, demo reset, word-reveal |
| `app/fonts/README.md` | **How to drop in the licensed Caesura / Peristiva files** |

**Scripts:**

| File | Purpose |
| --- | --- |
| `scripts/check-logic.ts` | Asserts graph shape, layout spacing, avatar-fill palette and initials contrast. Run after touching matching, layout, or the palette. |
| `scripts/demo-check.mjs` | Walks the demo in Chrome and asserts every DoD item. Run before presenting. |

## 6. Next up (in priority order)

0. **Add the licensed font files** — `Caesura.woff2` and `Peristiva.woff2` into
   `app/fonts/`, then uncomment the two `@font-face` blocks at the bottom of
   `app/globals.css`. Everything else is already wired. See `app/fonts/README.md`.
1. **Deploy to Vercel** — needs Abhi's go-ahead (it publishes a public URL).
2. QR code on the professor create/dashboard screen (spec "nice to have") — the
   join code is displayed large already, so this is genuinely optional.
3. Three-level visibility (public / match-only / private). The data model and
   `lib/privacy.ts` already support it end to end — only the onboarding UI is
   missing, so this is a contained change.
4. Optional LLM rephrasing of conversation starters behind an env flag. Must
   stay optional: the app has to work with zero API keys.

## 7. Decisions log

| Decision | Why |
| --- | --- |
| localStorage, no backend | The demo must not depend on a network call on stage. All access goes through `lib/store.ts`, so a Supabase adapter drops in without touching components. |
| Public/Skip visibility only in the UI | Spec §7.4 explicitly permits this MVP fallback. The data model and privacy layer already do all three levels. |
| React Flow over Cytoscape | Better React 19 / Next 16 story; custom node and edge components are plain JSX. |
| Languages question excludes English | If everyone lists English, "shared language" becomes noise and pushes weak pairs over the edge threshold. The question now reads "which *other* languages do you speak". |
| Low-connection boost affects suggestions, not edges | Keeps the drawn graph stable as people confirm introductions; only mission ranking shifts. |
| Seeded state pre-confirms 4 introductions | An all-dashed graph makes the "before" belonging number look dishonest. |
| Separate chart palette from UI accents | The brand accents sit outside the dark-mode lightness band for chart fills. `--chart-1..4` are darker steps of the same hues, validated for CVD separation and contrast against `#13182A`. |
| Node avatars drop the orbital rings | At 72px the rings blur the circle edge and make it ambiguous which name label belongs to which student. Rings stay on the passport, where there is room. |
| Layout tuned to 130px minimum separation | Measured, not guessed — `check-logic.ts` fails the build if nodes get closer. |
| Dev port pinned to 3210 | Port 3000 was already taken on this machine and Next silently migrated between ports mid-session. "Which port is it on?" is not a question to answer mid-demo. |
| React Flow attribution left visible | Hiding it requires a Pro licence. Not worth it for a hackathon. |
| **Type system: Caesura / Peristiva / Archivo** | Abhi's direction. `h1` and anything "important" is **Caesura, ALL CAPS + bold**; `h2` is **Peristiva** (headings only — never body copy); everything else is Archivo with Geist Mono for labels and data. Both display faces are **licensed and not in the repo** — see `app/fonts/README.md`. The stacks name `"Caesura"` and `"Peristiva"` FIRST, so dropping the files in and uncommenting two `@font-face` blocks activates them with no other change. Bodoni Moda and Instrument Serif carry the design until then. |
| Ink is warm plum `#221A1E`, not black | Abhi's direction. Pure black fought the wine and the paper. `#221A1E` keeps 13.95:1 on the page and 1.66:1 against the wine fill, so ink rules stay visible on wine buttons. |
| Logo is a wordmark, no icon | Abhi's direction. `OrbitMark` removed entirely; the header is the name set in the display face. |
| **Brutalist visual system** | Abhi's direction. Square corners everywhere (`--radius-card: 0`), 2px ink rules instead of hairlines, hard unblurred offset shadows (`--shadow-hard`), flat fills with no gradients, an exposed 48px grid, slab section labels, and buttons that physically depress on `:active`. Utility classes `.brut`, `.brut-shadow`, `.brut-press`, `.brut-label` live in `app/globals.css`. |
| Purple replaced by wine `#6D2A3B` | Abhi's direction. The token was **renamed** `violet` → `wine` across all 13 files rather than left as a `violet` variable holding a red — that would mislead the next agent. |
| Avatar fills use a fixed 10-colour palette | The old continuous hue wheel produced stray purples and pastels that fought the system. `AVATAR_FILLS` in `lib/passport.ts` is a restricted on-brand set; `check:logic` asserts every fill clears 4.5:1 against its initials (worst 4.64:1) and that every seeded student lands on-palette. |
| **Whole product switched to the paper theme** | Abhi asked for the passport's card-stock look across the entire app. This overrides spec §12's dark palette and the previous AGENTS.md lock — recorded here so it is not "fixed" back by a later agent. `--color-*` tokens in `app/globals.css` are the single source; almost nothing hardcodes colour. |
| Edge-category hues re-derived for paper | Spec §12's values land at **1.7-1.9:1** on cream — unreadable. Same four hue identities, re-derived and measured: blue `#1A5FA8` 5.80:1, violet `#6D33D6` 6.08:1, amber `#9A5B06` 4.86:1, green `#0E7D57` 4.60:1 (vs `--color-surface`). Category is still never carried by colour alone — glyph + label + line pattern all remain. |
| Avatar initials pick their own colour | `avatarTextColor()` in `lib/passport.ts` compares each fill against ink and paper and takes the better. `check:logic` fails below 4.5:1. |
| Chart ramp is the accent set itself | On paper the UI accents are already dark enough to serve as chart fills, so a legend swatch and the bar it labels are the same colour. No separate `--chart-*` hues to drift. |
| Passport is a paper ID card, the one light surface in Orbit | Modelled on the reference cards Abhi supplied: paper stock, dashed cut line, boxed typewriter fields, sprayed wordmark, rubber stamp, barcode, handwritten signature, two-sided flip. Now that the whole app is paper, the card keeps its own lighter stock (`--paper #fbf7ef` vs page `#efe8da`) plus a heavier shadow so it still lifts off the page as an object. |
| Landing rebuilt in Mindloop's *design language*, not its code | Abhi referenced hirael.com's Mindloop template. That is a commercial product; its markup was not copied. The editorial composition (oversized type, per-word manifesto reveal, card grid) is reimplemented from scratch in Orbit's locked dark palette. Spec §11 hero copy is preserved verbatim. |
| ~~Redesign scoped to the landing page only~~ — superseded | Mindloop is a light editorial page; Orbit's dark `#090B14` system is locked by spec §12. Restyling the app would have forced a full re-derivation of constellation edge colours for light-background contrast, touching the judged demo path. Abhi chose landing-only. |
| Skills offered and skills wanted are mutually exclusive in the UI | Listing the same skill in both produces a nonsense match reason ("they want to learn X, a skill they can help with"). Each chip list now hides what the other already claimed. |
| `read()` persists without notifying listeners | `read` is the `getSnapshot` for `useSyncExternalStore` and runs during render. The original version called `write()` there, which notified subscribers mid-render and produced a React "state update on a component that hasn't mounted yet" warning. Seeding now uses `persist()` (localStorage only, no notify). |
| Passport download is JPEG, generated in-browser | `html-to-image` captures both passport faces at 3× pixel density and downloads clearly named front/back files from one click. The only download control sits directly below the card; no HTML document is exported. |
| Passport stamp is the hackathon credential | The front carries a rectangular immigration-style `AI EDUCATION / HACKATHON / BUILDER / ADMITTED` stamp with a tiny orbit-route glyph. Its imperfect double rule and faded blue ink tie the student artefact to the event without copying sponsor branding. |
| Landing hero uses the recursive-erosion field | The original static seven-node SVG is replaced by the isolated dark particle-sphere visual in `components/ui/recursive-erosion.tsx`, framed in Orbit's square brutalist treatment and embedded with a descriptive iframe title. |
| Test student preset lives on the identity step | The clearly labelled testing shortcut fills all core and bonus answers with a fictional, matchable profile and jumps to review; the normal student path is unchanged. |

## 8. Blockers

**None blocking.** One environment quirk: macOS/iCloud keeps creating `"* 2.ts"`
duplicate files under `.next/types/`, which breaks `tsc` with duplicate-identifier
errors. `tsconfig.json` now excludes `**/* 2.ts*`. If typecheck fails oddly,
`rm -rf .next && npm run build` regenerates the Next-generated types.
 One operational hazard worth knowing:

> ⚠️ **Do not run two agents against this working tree at once.** During this
> session a second Claude Code session (`orbit-84`) was editing the same files
> concurrently. Symptoms: edits silently reverting, `scripts/` files reappearing
> after deletion, and the dev server dying mid-run. Diagnosed with `ListAgents`.
> If you switch to Codex, **stop the Claude session first** (or give each agent
> its own `git worktree` and merge). Everything is committed, so `git log` is the
> recovery path.

## 9. Demo script (spec §18) — mapped to real UI

| Time | Beat | Where |
| --- | --- | --- |
| 0:00–0:25 | Problem | Landing page, `/` |
| 0:25–1:05 | Join `ORBIT7`, answer 6 questions, passport reveal | `/join` → `/onboarding` → `/passport` |
| 1:05–1:55 | Enter constellation, click 2 edges, use a filter chip | `/constellation` |
| 1:55–2:25 | Mission → "We met" → dashed becomes solid | Mission panel, right side |
| 2:25–2:45 | Professor aggregates + Bridge the Class | `/professor/dashboard` |
| 2:45–3:00 | "Run the activity" → belonging pulse before/after | Bottom of dashboard |

**Before presenting:** `npm run dev`, then `npm run check:demo`, then hit
"Reset demo" in the header so the class is pristine.
