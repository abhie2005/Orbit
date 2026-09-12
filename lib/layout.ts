/**
 * Deterministic force-directed layout for the constellation.
 *
 * React Flow does not position nodes for you, and a plain circle puts every
 * edge through the middle. This is a tiny spring/repulsion simulation with a
 * fixed number of iterations and *no randomness*, so the same class always
 * produces the same constellation — important when a demo is rehearsed.
 *
 * Pure module — no React, no browser APIs.
 */

export type LayoutNode = { id: string };
export type LayoutEdge = { source: string; target: string; weight?: number };
export type Point = { x: number; y: number };

// Tuned with scripts/_tune.ts against the 12-student seed class: these values
// give a ~130px minimum node separation, so name labels never sit close enough
// to another student to look like they belong to them.
const ITERATIONS = 420;
const REPULSION = 150000;
const SPRING = 0.0075;
const IDEAL_LENGTH = 300;
const DAMPING = 0.86;
const CENTER_PULL = 0.0016;

export function layoutConstellation(
  nodes: readonly LayoutNode[],
  edges: readonly LayoutEdge[],
  options: { width?: number; height?: number } = {},
): Record<string, Point> {
  const width = options.width ?? 1300;
  const height = options.height ?? 900;
  const cx = width / 2;
  const cy = height / 2;

  const ids = [...nodes].map((n) => n.id).sort();
  const index = new Map(ids.map((id, i) => [id, i]));
  const count = ids.length;
  if (count === 0) return {};
  if (count === 1) return { [ids[0]]: { x: cx, y: cy } };

  // Deterministic start: an evenly spaced ring, offset so it never looks
  // machine-perfect once the simulation settles.
  const pos: Point[] = ids.map((_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const radius = 240 + (i % 3) * 34;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });
  const vel: Point[] = ids.map(() => ({ x: 0, y: 0 }));

  const springs = edges
    .map((e) => ({
      a: index.get(e.source),
      b: index.get(e.target),
      weight: e.weight ?? 1,
    }))
    .filter((s): s is { a: number; b: number; weight: number } => s.a !== undefined && s.b !== undefined);

  for (let step = 0; step < ITERATIONS; step += 1) {
    const force: Point[] = ids.map(() => ({ x: 0, y: 0 }));

    // Repulsion between every pair keeps nodes from stacking.
    for (let i = 0; i < count; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        let dx = pos[i].x - pos[j].x;
        let dy = pos[i].y - pos[j].y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 1) {
          // Deterministic nudge rather than a random one.
          dx = (i - j) || 1;
          dy = 1;
          distSq = dx * dx + dy * dy;
        }
        const dist = Math.sqrt(distSq);
        const magnitude = REPULSION / distSq;
        const fx = (dx / dist) * magnitude;
        const fy = (dy / dist) * magnitude;
        force[i].x += fx;
        force[i].y += fy;
        force[j].x -= fx;
        force[j].y -= fy;
      }
    }

    // Springs pull connected students together — stronger for stronger matches.
    for (const spring of springs) {
      const dx = pos[spring.b].x - pos[spring.a].x;
      const dy = pos[spring.b].y - pos[spring.a].y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const stiffness = SPRING * Math.min(spring.weight, 3);
      const magnitude = (dist - IDEAL_LENGTH) * stiffness;
      const fx = (dx / dist) * magnitude;
      const fy = (dy / dist) * magnitude;
      force[spring.a].x += fx;
      force[spring.a].y += fy;
      force[spring.b].x -= fx;
      force[spring.b].y -= fy;
    }

    for (let i = 0; i < count; i += 1) {
      force[i].x += (cx - pos[i].x) * CENTER_PULL * 60;
      force[i].y += (cy - pos[i].y) * CENTER_PULL * 60;

      vel[i].x = (vel[i].x + force[i].x * 0.016) * DAMPING;
      vel[i].y = (vel[i].y + force[i].y * 0.016) * DAMPING;
      pos[i].x += vel[i].x;
      pos[i].y += vel[i].y;
    }
  }

  return Object.fromEntries(
    ids.map((id, i) => [
      id,
      { x: Math.round(pos[i].x * 10) / 10, y: Math.round(pos[i].y * 10) / 10 },
    ]),
  );
}
