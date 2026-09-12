"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { OrbitAvatar } from "@/components/passport/orbit-avatar";
import type { StudentNode } from "./graph-types";

/**
 * Every node is EXACTLY the same size. This is a product invariant, not a
 * styling choice — size must never encode how connected someone is (spec §7.6).
 */
export const NODE_SIZE = 72;

export function StudentNode({ data, selected }: NodeProps<StudentNode>) {
  const { passport, isCurrent, dimmed } = data;

  return (
    <div
      className="relative transition-opacity duration-300"
      style={{ width: NODE_SIZE, height: NODE_SIZE, opacity: dimmed ? 0.2 : 1 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ left: "50%", top: "50%", opacity: 0 }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: "50%", top: "50%", opacity: 0 }}
        isConnectable={false}
      />

      <div
        className={`rounded-full ${
          selected
            ? "ring-2 ring-blue ring-offset-4 ring-offset-[color:var(--orbit-bg)]"
            : isCurrent
              ? "ring-2 ring-amber ring-offset-4 ring-offset-[color:var(--orbit-bg)]"
              : ""
        }`}
        style={{ width: NODE_SIZE, height: NODE_SIZE }}
      >
        <OrbitAvatar
          passport={passport}
          size={NODE_SIZE}
          animate={false}
          showRings={false}
        />
      </div>

      {/* Absolutely positioned so the node box stays exactly NODE_SIZE wide and
          React Flow's measured size matches the circle it is meant to centre. */}
      <span data-orbit-label className="pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-none bg-[color:var(--orbit-surface)]/90 px-2 py-0.5 text-xs font-medium text-ink">
        {passport.student.displayName}
        {isCurrent ? <span className="text-amber"> · you</span> : null}
      </span>
    </div>
  );
}
