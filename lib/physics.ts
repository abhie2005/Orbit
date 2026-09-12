/**
 * Zero-gravity constellation physics.
 *
 * Drag a student and the people they are connected to drift after them, pulled
 * harder by stronger bonds. There is no gravity and no floor: bodies coast and
 * slowly settle, the way things move in orbit.
 *
 * Bond strength is NOT invented here — it comes from the same deterministic
 * `Connection.score` the graph is drawn from, plus a bump for confirmed
 * introductions (a solid line pulls harder than a dashed suggestion). So the
 * motion is another reading of the same explainable data.
 *
 * Pure module — no React, no browser APIs.
 */

export type Body = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** The dragged node is pinned to the cursor and ignores all forces. */
  pinned: boolean;
};

export type Link = {
  a: string;
  b: string;
  /** 0..1, derived from connection score and confirmed status. */
  strength: number;
};

export const PHYSICS = {
  /** How hard a link pulls. Scaled per-link by `strength`. */
  springBase: 0.042,
  /**
   * Natural separation for a link at full strength. Matches the one-shot
   * layout's ideal edge length, so grabbing a node does not yank the whole
   * graph into a different (tighter) equilibrium.
   */
  restLength: 330,
  /** Weak bonds want to sit further apart than strong ones. */
  restSpread: 150,
  /**
   * Repulsion is GLOBAL, not radius-limited. Springs attract at any distance,
   * so a cutoff radius left long edges pulling with nothing pushing back and
   * the whole constellation collapsed inward on the first drag.
   */
  repulsion: 165000,
  /** Springs are clamped so one very long edge cannot yank a node across. */
  maxSpringForce: 2.2,
  /** Low damping is what makes it read as zero-g rather than syrup. */
  damping: 0.90,
  /**
   * Barely-there pull home so a flung cluster cannot drift off screen forever.
   * Kept tiny: anything stronger fights the arrangement the user just made.
   */
  homing: 0.00035,
  maxSpeed: 18,
} as const;

/**
 * Advance the simulation one frame. Mutates `bodies` in place and returns the
 * total kinetic energy, which the caller uses to decide when motion has settled.
 */
export function stepPhysics(
  bodies: Body[],
  links: readonly Link[],
  home: { x: number; y: number },
  /**
   * Extra damping applied after the user lets go. 57 springs cannot all be
   * satisfied at once, so the system would otherwise jitter around a frustrated
   * equilibrium forever. Cooling guarantees it comes to rest.
   */
  cooling = 1,
): number {
  const byId = new Map(bodies.map((b) => [b.id, b]));

  // Springs — the whole point: connected people follow, weighted by bond.
  for (const link of links) {
    const a = byId.get(link.a);
    const b = byId.get(link.b);
    if (!a || !b) continue;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.max(Math.hypot(dx, dy), 0.01);
    // Strong bonds sit closer AND pull harder.
    const rest = PHYSICS.restLength + (1 - link.strength) * PHYSICS.restSpread;
    const raw = (dist - rest) * PHYSICS.springBase * link.strength;
    const force = Math.max(-PHYSICS.maxSpringForce, Math.min(PHYSICS.maxSpringForce, raw));
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!a.pinned) {
      a.vx += fx;
      a.vy += fy;
    }
    if (!b.pinned) {
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  // Global repulsion — every pair, no cutoff. This is what balances the springs.
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i];
      const b = bodies[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.max(Math.sqrt(distSq), 0.01);
      const magnitude = PHYSICS.repulsion / Math.max(distSq, 2500);
      const fx = (dx / dist) * magnitude;
      const fy = (dy / dist) * magnitude;
      if (!a.pinned) {
        a.vx += fx;
        a.vy += fy;
      }
      if (!b.pinned) {
        b.vx -= fx;
        b.vy -= fy;
      }
    }
  }

  let energy = 0;
  for (const body of bodies) {
    if (body.pinned) {
      body.vx = 0;
      body.vy = 0;
      continue;
    }

    body.vx += (home.x - body.x) * PHYSICS.homing;
    body.vy += (home.y - body.y) * PHYSICS.homing;

    body.vx *= PHYSICS.damping * cooling;
    body.vy *= PHYSICS.damping * cooling;

    const speed = Math.hypot(body.vx, body.vy);
    if (speed > PHYSICS.maxSpeed) {
      body.vx = (body.vx / speed) * PHYSICS.maxSpeed;
      body.vy = (body.vy / speed) * PHYSICS.maxSpeed;
    }

    body.x += body.vx;
    body.y += body.vy;
    energy += body.vx * body.vx + body.vy * body.vy;
  }

  return energy;
}

/**
 * Map a connection onto a 0..1 pull. A confirmed introduction (solid line)
 * always outpulls a suggestion (dashed) of the same score.
 */
export function linkStrength(score: number, confirmed: boolean): number {
  const normalised = Math.min(score / 14, 1);
  const base = 0.25 + normalised * 0.6;
  return Math.min(confirmed ? base * 1.35 : base, 1);
}
