# Orbit — Agent Brief

> Read this first. Then read `STATUS.md` for what is done and what is next.
> The full product spec is `Orbit-about.md` — it is the source of truth for
> product decisions. This file is the source of truth for *engineering*
> decisions already made. Do not re-litigate them mid-hackathon.

## What we're building

Hackathon prototype. A first-day classroom connection app: students fill a short
optional questionnaire, get a visual "passport", and appear as a node in a
classroom constellation graph with **explainable** edges. Professors get
privacy-preserving aggregate insights and a "Bridge the Class" grouping tool.

**Definition of done** is section 23 of `Orbit-about.md`. The whole demo must run
in under 3 minutes with no manual data editing.

## Stack (locked — do not change)

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`, no config file) |
| Graph | `@xyflow/react` v12 (React Flow) |
| Animation | `framer-motion` v13 |
| Validation | `zod` v4 |
| Persistence | **localStorage only.** No backend, no Supabase, no auth. |
| Deploy | Vercel (`vercel --prod`) |

Rationale for localStorage: the demo is single-device and must never fail on
stage because of a network call. Data access is funnelled through
`lib/store.ts` so a Supabase adapter can be swapped in later without touching
components.

## Architecture rules

1. **All matching is deterministic.** `lib/matching.ts` is pure functions over
   `StudentFeatures`. No LLM, no randomness, no hidden scoring. Every edge
   carries a `MatchReason[]` that the UI renders verbatim in plain language.
2. **AI is optional garnish.** Conversation prompts come from templates in
   `lib/missions.ts`. An LLM may only rephrase; the app must be fully
   functional with zero API keys configured.
3. **Server/client boundary.** Pages are server components where possible.
   Anything touching localStorage, React Flow, or framer-motion is `"use client"`
   and lives in `components/`.
4. **Store is client-only.** `lib/store.ts` reads/writes localStorage behind a
   typed API. Never touch `localStorage` directly from a component.
5. **Pure logic stays importable from Node.** `lib/matching.ts`,
   `lib/grouping.ts`, `lib/questions.ts`, `lib/seed-data.ts` must have no React
   or browser imports so they stay unit-testable via `npm run check:logic`.
6. **Everything is typed.** No `any`. `npm run typecheck` must pass before any
   commit.

## Product invariants (these are the judged differentiators — never break them)

- **No popularity signals.** Never render a connection count, follower count,
  ranking, like, or "isolated" label anywhere in student-facing UI.
- **All graph nodes are the same size.** Always. Size never encodes degree.
- **Every edge is explainable.** If you cannot state the reason in one plain
  sentence from explicit answers, do not draw the edge.
- **Every question except display name is skippable.**
- **Colour is never the only channel.** Every edge category also carries a text
  label and a distinct line pattern; every legend entry names the category.
- **Accessible list view is a peer of the graph**, not a fallback. Keyboard
  reachable, same data, same explanations.
- **Respect `prefers-reduced-motion`** — gate every animation on it.
- Never match on inferred demographics. Only explicit, student-entered tags.

## Colour tokens (from spec §12, defined in `app/globals.css`)

```
--bg #090B14   --surface #13182A   --violet #8B5CF6   --blue #38BDF8
--amber #F59E0B  --green #34D399   --text #F8FAFC     --muted #AAB4CB
```

Edge categories: academic = blue, social = amber, complementary_skill =
violet, language = green. Suggested = dashed, confirmed = solid.

## Directory map

```
app/        routes (see STATUS.md for which exist)
components/ passport/ constellation/ onboarding/ missions/ dashboard/ ui/
lib/        types.ts questions.ts seed-data.ts matching.ts grouping.ts
            missions.ts store.ts privacy.ts
scripts/    check-logic.mjs  (node-run sanity checks on pure logic)
```

## Commands

```bash
npm run dev          # localhost:3000
npm run build        # must pass before demo
npm run typecheck    # tsc --noEmit
npm run check:logic  # runs scripts/check-logic.mjs against lib/ pure logic
npm run lint
```

## Working agreement for agents (Claude Code / Codex / anything else)

- **Update `STATUS.md` after every meaningful unit of work.** It is the handoff
  contract between sessions and between different AI tools. Keep the "Next up"
  list and the file inventory accurate — a stale STATUS.md is worse than none.
- Commit often with small messages. `git log --oneline` is the recovery path.
- Prefer finishing the demo path over polishing any single screen.
- If you hit an unrecoverable blocker, write it under "Blockers" in STATUS.md
  with the exact error before stopping.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
