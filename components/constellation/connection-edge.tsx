"use client";

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from "@xyflow/react";
import { EDGE_CATEGORIES } from "@/lib/matching";
import type { ConnectionEdge } from "./graph-types";

/**
 * Line style carries STATUS (dashed = suggested, solid = both confirmed they
 * met). Colour plus the glyph on the label carries CATEGORY. Colour is never
 * the only channel.
 */
export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<ConnectionEdge>) {
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const category = data?.category ?? "academic";
  const color = EDGE_CATEGORIES[category].colorVar;
  const confirmed = data?.confirmed ?? false;
  const dimmed = data?.dimmed ?? false;
  const highlighted = data?.highlighted ?? false;

  // Paper needs a higher resting opacity than the old dark canvas did.
  const opacity = dimmed ? 0.09 : highlighted || selected ? 1 : 0.58;
  const width = selected ? 3.4 : highlighted ? 2.6 : confirmed ? 2 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth: width,
          strokeDasharray: confirmed ? undefined : "7 7",
          strokeLinecap: "round",
          opacity,
          filter: selected || highlighted ? `drop-shadow(0 0 6px ${color})` : undefined,
          transition: "opacity 240ms ease, stroke-width 180ms ease",
        }}
      />

      {selected ? (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              borderColor: color,
              color,
            }}
            className="pointer-events-none absolute rounded-full border bg-[color:var(--orbit-surface)] px-2.5 py-1 text-[0.7rem] font-medium"
          >
            <span aria-hidden="true">{data?.glyph} </span>
            {data?.categoryLabel}
            {confirmed ? " · met" : " · suggested"}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
