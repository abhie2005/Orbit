# Orbit — Build Status

**Last updated:** 2026-09-12 — session 1 (Claude Code)
**Phase:** M7 — feature-complete, polishing
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
| `lib/questions.ts` | Controlled vocabularies + 11-question bank (6 core, 5 bonus) |
| `lib/privacy.ts` | The only place deciding passport-visible vs match-usable |
| `lib/matching.ts` | `scorePair`, `buildConstellation`, `rankSuggestionsFor`, `explainReasons` |
| `lib/grouping.ts` | `bridgeTheClass` greedy grouping + rationale strings |
| `lib/missions.ts` | Templated conversation starters — deterministic, no LLM needed |
| `lib/insights.ts` | Aggregate-only professor stats (deliberately has no "isolated students" function) |
| `lib/layout.ts` | Deterministic force layout for the constellation |
| `lib/passport.ts` | Deterministic passport visuals derived from student id |
| `lib/seed-data.ts` | The 12 fictional students, demo classroom, "before" pulse |

**Client:**

| File | Purpose |
| --- | --- |
| `lib/store.ts` | localStorage store via `useSyncExternalStore`; every action lives here |
| `app/page.tsx` | Landing |
| `app/join`, `components/onboarding/join-form.tsx` | Join code |
| `app/onboarding`, `components/onboarding/onboarding-flow.tsx` | Question flow + chips |
| `app/passport`, `components/passport/*` | Passport card, orbital avatar, reveal |
| `app/constellation`, `components/constellation/*` | Graph, custom node/edge, legend, list view |
| `components/missions/mission-panel.tsx` | One mission at a time, skip is free |
| `app/professor/create`, `app/professor/dashboard`, `components/dashboard/*` | Professor side |
| `components/ui/*` | Primitives, header, hero graphic, demo reset |

**Scripts:**

| File | Purpose |
| --- | --- |
| `scripts/check-logic.ts` | Asserts graph shape + layout. Run after touching matching or layout. |
| `scripts/demo-check.mjs` | Walks the demo in Chrome and asserts every DoD item. Run before presenting. |

## 6. Next up (in priority order)

1. **Deploy to Vercel** — needs Abhi's go-ahead (it publishes a public URL).
2. QR code on the professor create/dashboard screen (spec "nice to have") — the
   join code is displayed large already, so this is genuinely optional.
3. Passport download / share image.
4. Three-level visibility (public / match-only / private). The data model and
   `lib/privacy.ts` already support it end to end — only the onboarding UI is
   missing, so this is a contained change.
5. Optional LLM rephrasing of conversation starters behind an env flag. Must
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

| `read()` persists without notifying listeners | `read` is the `getSnapshot` for `useSyncExternalStore` and runs during render. The original version called `write()` there, which notified subscribers mid-render and produced a React "state update on a component that hasn't mounted yet" warning. Seeding now uses `persist()` (localStorage only, no notify). |

## 8. Blockers

**None blocking.** One operational hazard worth knowing:

> ⚠️ **Do not run two agents against this working tree at once.** During this
> session a second Claude Code session (`orbit-84`) was editing the same files
> concurrently. Symptoms: edits silently reverting, `scripts/` files reappearing
> after deletion, and the dev server dying mid-run. Diagnosed with `ListAgents`.
> If you switch to Codex, **stop the Claude session first** (or give each agent
> its own `git worktree` and merge). Everything is committed, so `git log` is the
> recovery path.


*(none)*

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
