"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Node } from "@xyflow/react";
import { linkStrength, stepPhysics, type Body, type Link } from "@/lib/physics";
import type { Connection } from "@/lib/types";

/**
 * Drives the zero-gravity simulation and writes positions straight into React
 * Flow each frame.
 *
 * Positions live in a ref, not React state: at 60fps a state update per frame
 * would re-render the whole graph tree. `setNodes` is React Flow's own store
 * updater and is built for exactly this.
 */
export function usePhysics({
  seedPositions,
  connections,
  enabled,
  nodeOffset,
  setNodes,
}: {
  seedPositions: Record<string, { x: number; y: number }>;
  connections: readonly Connection[];
  enabled: boolean;
  /** Half the node size — React Flow positions by top-left, physics by centre. */
  nodeOffset: number;
  /**
   * The setter from `useNodesState`. It must be the same state the `nodes` prop
   * is read from, otherwise the prop overwrites every frame the physics writes.
   */
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}) {
  const bodiesRef = useRef<Body[]>([]);
  const linksRef = useRef<Link[]>([]);
  const frameRef = useRef<number | null>(null);
  const releasedAtRef = useRef<number>(0);
  const homeRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef<string | null>(null);

  // (Re)seed whenever the class or its edges change.
  useEffect(() => {
    const ids = Object.keys(seedPositions);
    const existing = new Map(bodiesRef.current.map((b) => [b.id, b]));
    bodiesRef.current = ids.map((id) => {
      const prev = existing.get(id);
      const seed = seedPositions[id];
      // Keep a body where the user left it; only new students get seeded.
      // Preserve pinned state: re-seeding runs on every data change, and
      // clearing it would silently undo the user's arrangement.
      return prev ?? { id, x: seed.x, y: seed.y, vx: 0, vy: 0, pinned: false };
    });

    const xs = ids.map((id) => seedPositions[id].x);
    const ys = ids.map((id) => seedPositions[id].y);
    homeRef.current = {
      x: xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1),
      y: ys.reduce((a, b) => a + b, 0) / Math.max(ys.length, 1),
    };
  }, [seedPositions]);

  useEffect(() => {
    linksRef.current = connections
      .filter((c) => c.status !== "dismissed")
      .map((c) => ({
        a: c.studentAId,
        b: c.studentBId,
        strength: linkStrength(c.score, c.status === "confirmed"),
      }));
  }, [connections]);

  const flush = useCallback(() => {
    const byId = new Map(bodiesRef.current.map((b) => [b.id, b]));
    setNodes((nds: Node[]) =>
      nds.map((n) => {
        const body = byId.get(n.id);
        if (!body) return n;
        return { ...n, position: { x: body.x - nodeOffset, y: body.y - nodeOffset } };
      }),
    );
  }, [setNodes, nodeOffset]);

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    if (!enabled || frameRef.current !== null) return;
    const tick = () => {
      const dragging = draggingRef.current !== null;
      // Full coast for the first second after release, then cool to a stop.
      const sinceRelease = dragging ? 0 : performance.now() - releasedAtRef.current;
      const cooling = dragging ? 1 : Math.max(0.8, 1 - sinceRelease / 2500);

      const energy = stepPhysics(
        bodiesRef.current,
        linksRef.current,
        homeRef.current,
        cooling,
      );
      flush();

      /*
       * Stop on EITHER low energy or a hard deadline. Energy alone is not a
       * reliable stop: with 57 springs the system settles into a frustrated
       * equilibrium it can jitter around indefinitely.
       */
      const expired = !dragging && sinceRelease > 2600;
      if (dragging || (energy > 0.6 && !expired)) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        // Park the remaining velocity so nothing creeps.
        for (const body of bodiesRef.current) {
          body.vx = 0;
          body.vy = 0;
        }
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [enabled, flush]);

  useEffect(() => stop, [stop]);

  const onDragStart = useCallback(
    (id: string) => {
      draggingRef.current = id;
      const body = bodiesRef.current.find((b) => b.id === id);
      if (body) body.pinned = true;
      run();
    },
    [run],
  );

  /** React Flow reports top-left; physics wants the centre. */
  const onDrag = useCallback(
    (id: string, position: { x: number; y: number }) => {
      const body = bodiesRef.current.find((b) => b.id === id);
      if (!body) return;
      body.x = position.x + nodeOffset;
      body.y = position.y + nodeOffset;
    },
    [nodeOffset],
  );

  /**
   * Dropped nodes STAY where you put them.
   *
   * Unpinning on release let the springs pull the node straight back to the
   * global equilibrium, so the drag looked like it had been undone. Keeping it
   * pinned is what makes "grab someone and the people bonded to them drift
   * after" actually read — the anchor holds, the neighbours move.
   */
  const onDragStop = useCallback((id: string) => {
    draggingRef.current = null;
    releasedAtRef.current = performance.now();
    const body = bodiesRef.current.find((b) => b.id === id);
    if (body) {
      body.pinned = true;
      body.vx = 0;
      body.vy = 0;
    }
  }, []);

  /** Release every pinned node so the class relaxes back on its own. */
  const unpinAll = useCallback(() => {
    for (const body of bodiesRef.current) body.pinned = false;
    releasedAtRef.current = performance.now();
    run();
  }, [run]);

  /** Nudge everything so a fresh graph settles into its springs on arrival. */
  const settle = useCallback(() => {
    if (!enabled) return;
    // The loop stops on a deadline measured from the last release, so seed it.
    releasedAtRef.current = performance.now();
    run();
  }, [enabled, run]);

  return { onDragStart, onDrag, onDragStop, settle, unpinAll };
}
