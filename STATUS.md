# Orbit — Build Status

**Last updated:** 2026-09-12 — session 1 (Claude Code)
**Phase:** Foundation / core logic
**Demo runnable:** ❌ not yet
**Build passing:** ✅ (scaffold only)

> Read `AGENTS.md` first for locked engineering decisions.
> Read `Orbit-about.md` for the product spec.
> **Any agent working on this repo must update this file after each unit of work.**

---

## 1. Current state

Next.js 16 + TS + Tailwind v4 scaffolded. Dependencies installed. No product
code written yet beyond the default template page.

## 2. Milestones

| # | Milestone | Status |
| --- | --- | --- |
| M0 | Scaffold + deps + agent docs | ✅ done |
| M1 | Core domain logic (`lib/`) + seed data + matching | ⬜ todo |
| M2 | Design system + landing page | ⬜ todo |
| M3 | Join → onboarding → passport flow | ⬜ todo |
| M4 | Constellation graph + accessible list view | ⬜ todo |
| M5 | Connection missions (dashed → solid) | ⬜ todo |
| M6 | Professor dashboard + Bridge the Class + belonging pulse | ⬜ todo |
| M7 | Demo reset, polish, build, deploy | ⬜ todo |

## 3. Definition of done checklist (spec §23)

- [ ] Professor can open the seeded classroom dashboard
- [ ] New student can join with a code and answer six questions
- [ ] Student receives a visually distinctive passport
- [ ] Their node appears in the constellation
- [ ] At least three explainable connections appear
- [ ] Student can complete a connection mission
- [ ] A suggested edge changes from dashed to solid
- [ ] Professor view shows aggregate before/after belonging data
- [ ] Full flow demoable in under 3 minutes with no manual data edits
- [ ] Demo reset button works repeatably

## 4. File inventory

| File | Purpose | Status |
| --- | --- | --- |
| `AGENTS.md` | Locked engineering decisions + invariants | ✅ |
| `STATUS.md` | This file — living handoff | ✅ |
| `Orbit-about.md` | Product spec (source of truth) | ✅ given |

*(nothing else written yet)*

## 5. Next up

1. `lib/types.ts` — domain types from spec §14
2. `lib/questions.ts` — question bank + controlled option lists
3. `lib/seed-data.ts` — the 12 fictional students from spec §16
4. `lib/matching.ts` — deterministic pair score + `MatchReason[]`
5. `lib/grouping.ts` — greedy Bridge the Class
6. `scripts/check-logic.mjs` — prove matching works before any UI exists

## 6. Decisions log

| Decision | Why |
| --- | --- |
| localStorage, no backend | Demo must not depend on network on stage. Store is behind a typed adapter so Supabase can drop in later. |
| Public/Skip visibility only (spec §7.4 allows this) | Three-level privacy is a UI tax; spec explicitly permits the two-state fallback for MVP. Revisit if time remains. |
| React Flow over Cytoscape | Better React 19 / Next 16 story, custom node + edge components are plain JSX. |

## 7. Blockers

*(none)*

## 8. Demo script timings (spec §18)

| Time | Beat |
| --- | --- |
| 0:00–0:25 | Problem |
| 0:25–1:05 | Join + answer 6 questions + passport reveal |
| 1:05–1:55 | Constellation, inspect 2 edges, filter |
| 1:55–2:25 | Mission → confirm → dashed becomes solid |
| 2:25–2:45 | Professor dashboard + Bridge the Class |
| 2:45–3:00 | Belonging pulse before/after |
