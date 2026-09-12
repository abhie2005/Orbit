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

  /**
   * With ~30 edges the graph turns into spaghetti if every line shouts. Resting
   * lines stay thin and quiet; hierarchy arrives on hover/selection through
   * stroke WEIGHT, which brutalism is happy with, rather than colour tricks.
   */
  const opacity = dimmed ? 0.14 : selected ? 1 : highlighted ? 0.95 : 0.5;
  const width = selected ? 5 : highlighted ? 3.4 : confirmed ? 2.2 : 1.4;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={22}
        style={{
          stroke: color,
          strokeWidth: width,
          strokeDasharray: confirmed ? undefined : "7 7",
          strokeLinecap: "butt",
          opacity,
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
            className="pointer-events-none absolute rounded-none border bg-[color:var(--orbit-surface)] px-2.5 py-1 text-[0.7rem] font-medium"
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
