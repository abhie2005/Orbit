# Orbit

> Turn a room full of strangers into a classroom community.

Orbit is a first-day classroom connection experience. Students answer a short
set of optional questions, get a collectible digital passport, and appear in an
interactive classroom constellation where **every connection explains itself in
plain language**. Professors get privacy-preserving aggregate insights and a
grouping tool that quietly prioritises students who have not met anyone yet.

Orbit is not a dating app, a social feed, or a personality test. There are no
follower counts, no rankings, and no way for anyone — including the professor —
to see how connected an individual student is.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3210
```

**Demo class join code: `ORBIT7`** — preloaded with 12 fictional students.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on a pinned port (3210) |
| `npm run verify` | Typecheck + logic assertions + production build |
| `npm run check:logic` | Asserts the seeded graph's shape, determinism and spacing |
| `npm run check:demo` | Walks the entire demo in Chrome and asserts every done-criterion |
| `npm run build` | Production build |

`check:demo` needs the dev server running.

## How matching works

Matching is **deterministic and explainable**. No LLM, no randomness, no hidden
scores. `lib/matching.ts` compares controlled-vocabulary tags that students
chose for themselves and returns the reasons alongside the number:

```
pairScore = 3.0 × shared academic interests
          + 2.0 × shared hobbies
          + 1.5 × shared movies or sports
          + 3.5 × complementary skills   (one offers what the other wants)
          + 1.0 × shared languages
          + 1.0 × compatible meeting preference
          + 2.5 × low-connection boost    (suggestions only, not the drawn graph)
          − 2.0 × repeated-pairing penalty
```

An edge is only drawn if it clears a score threshold **and** carries at least
one reason. If Orbit cannot say why in one sentence, it does not draw the line.

Free-text answers appear on the passport but are never scored. Nothing
demographic is ever inferred or used.

## Product invariants

These are enforced, not aspirational — `check:demo` asserts several of them:

- Every graph node is exactly the same size. Size never encodes degree.
- No follower counts, rankings, likes, or "isolated" labels anywhere.
- Only the display name is required; every other question is skippable.
- Colour is never the only channel — each edge category also carries a glyph, a
  name, and a text explanation, and the list view is a full peer of the graph.
- `prefers-reduced-motion` disables every decorative animation.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Flow
(`@xyflow/react`) · Framer Motion · Zod. State lives in localStorage behind
`lib/store.ts`, so there is no backend to fail during a demo.

## Documentation

| File | What it is |
| --- | --- |
| `Orbit-about.md` | The product spec — source of truth for product decisions |
| `AGENTS.md` | Locked engineering decisions and invariants (also read by Codex) |
| `STATUS.md` | Living build status, file inventory, decisions log, next steps |

## Honest limitations

This is a hackathon prototype. All student data is fictional. It has not been
reviewed for FERPA, institutional privacy, or child-safety requirements, and it
does not claim that a graph edge represents friendship — it records
introductions and anonymous self-reported belonging, nothing more.
