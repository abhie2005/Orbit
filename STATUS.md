# Orbit — Build Status

**Last updated:** 2026-09-12 — session 1 (Claude Code)
**Phase:** M3 done — student flow works end to end
**Demo runnable:** 🟡 partial (join → onboarding → passport works; graph not built yet)
**Build passing:** ✅ `npm run verify`

> Read `AGENTS.md` first for locked engineering decisions.
> Read `Orbit-about.md` for the product spec.
> **Any agent working on this repo must update this file after each unit of work.**

---

## 1. Current state

All pure domain logic is written and **verified by assertion**, not by eyeballing:
`npm run check:logic` builds the seeded graph and asserts its shape. Result:
26 edges across 12 students, Abhi↔Maya is the top edge (18.5) exactly as the
spec's demo script needs, and Aisha is the single sparse student with 1 edge.

The student path — landing → join → 6-question onboarding → animated passport
reveal — runs end to end in the browser against localStorage.

## 2. Milestones

| # | Milestone | Status |
| --- | --- | --- |
| M0 | Scaffold + deps + agent docs | ✅ done |
| M1 | Core domain logic (`lib/`) + seed data + matching | ✅ done |
| M2 | Design system + landing page | ✅ done |
| M3 | Join → onboarding → passport flow | ✅ done |
| M4 | Constellation graph + accessible list view | ⬜ todo |
| M5 | Connection missions (dashed → solid) | ⬜ todo |
| M6 | Professor dashboard + Bridge the Class + belonging pulse | ⬜ todo |
| M7 | Demo reset, polish, build, deploy | ⬜ todo |

## 3. Definition of done checklist (spec §23)

- [ ] Professor can open the seeded classroom dashboard
- [x] New student can join with a code and answer six questions
- [x] Student receives a visually distinctive passport
- [ ] Their node appears in the constellation
- [ ] At least three explainable connections appear
- [ ] Student can complete a connection mission
- [ ] A suggested edge changes from dashed to solid
- [ ] Professor view shows aggregate before/after belonging data
- [ ] Full flow demoable in under 3 minutes with no manual data edits
- [ ] Demo reset button works repeatably

## 4. File inventory

**Pure logic — no React, no browser APIs, unit-checkable from Node:**

| File | Purpose |
| --- | --- |
| `lib/types.ts` | Domain types (spec §14) + `MatchReason.direction` for skill-exchange copy |
| `lib/questions.ts` | Controlled vocabularies + 11-question bank (6 core, 5 bonus) |
| `lib/privacy.ts` | Visibility rules; the only place that decides passport-visible vs match-usable |
| `lib/matching.ts` | `scorePair`, `buildConstellation`, `rankSuggestionsFor`, `explainReasons` |
| `lib/grouping.ts` | `bridgeTheClass` greedy grouping with rationale strings |
| `lib/missions.ts` | Templated conversation starters; deterministic, no LLM needed |
| `lib/seed-data.ts` | The 12 fictional students + demo classroom + "before" pulse |
| `lib/passport.ts` | Deterministic passport visuals derived from student id |

**Client:**

| File | Purpose |
| --- | --- |
| `lib/store.ts` | localStorage store via `useSyncExternalStore`; all actions live here |
| `app/page.tsx` | Landing |
| `app/join/page.tsx` + `components/onboarding/join-form.tsx` | Join code |
| `app/onboarding/page.tsx` + `components/onboarding/onboarding-flow.tsx` | Question flow |
| `app/passport/page.tsx` + `components/passport/*` | Passport reveal |
| `components/ui/*` | Primitives, header, hero graphic |
| `scripts/check-logic.ts` | Asserts graph shape — run it after touching matching |

## 5. Next up

1. `components/constellation/*` — React Flow graph, equal-size nodes, edge
   colour + dash by category, click an edge to see its plain-language reason
2. Accessible list view (peer of the graph, same data, keyboard reachable)
3. Mission panel — confirm an introduction, animate dashed → solid
4. Professor dashboard — aggregates, Bridge the Class, belonging pulse
5. Professor create-class page
6. Demo reset control in the header

## 6. Decisions log

| Decision | Why |
| --- | --- |
| localStorage, no backend | Demo must not depend on network on stage. Store is behind a typed adapter so Supabase can drop in later. |
| Public/Skip visibility only (spec §7.4 allows this) | Three-level privacy is a UI tax; spec explicitly permits the two-state fallback for MVP. Revisit if time remains. |
| React Flow over Cytoscape | Better React 19 / Next 16 story, custom node + edge components are plain JSX. |
| Languages question excludes English | If everyone lists English, "shared language" becomes noise and pushes weak pairs over the edge threshold. Question now reads "which *other* languages do you speak". |
| Low-connection boost affects suggestions, not edges | Keeps the drawn graph stable as people confirm introductions; only mission ranking shifts. |
| Seeded state pre-confirms 4 introductions | An all-dashed graph makes the "before" belonging number look dishonest. |

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
