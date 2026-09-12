"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, useReducedMotion } from "framer-motion";
import { OrbitAvatar } from "@/components/passport/orbit-avatar";
import type { StudentNode } from "./graph-types";

/**
 * Every node is EXACTLY the same size. This is a product invariant, not a
 * styling choice — size must never encode how connected someone is (spec §7.6).
 */
export const NODE_SIZE = 52;

export function StudentNode({ data, selected }: NodeProps<StudentNode>) {
  const { passport, isCurrent, dimmed, focused, index } = data;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: NODE_SIZE, height: NODE_SIZE }}
      /*
       * Node entry (spec §12). Only opacity and offset animate — never scale,
       * because every node must measure the same size at all times.
       */
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: dimmed ? 0.2 : 1, y: 0 }}
      transition={{
        opacity: {
          duration: reduceMotion ? 0 : 0.3,
          delay: reduceMotion ? 0 : Math.min(index, 14) * 0.035,
        },
        y: {
          duration: reduceMotion ? 0 : 0.4,
          delay: reduceMotion ? 0 : Math.min(index, 14) * 0.035,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
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
      <span
        data-orbit-label
        className="pointer-events-none absolute left-1/2 top-full mt-2.5 max-w-[9rem] -translate-x-1/2 truncate border-2 border-ink bg-surface px-2 py-0.5 text-xs font-bold text-ink"
      >
        {passport.student.displayName}
        {isCurrent ? <span className="text-amber"> · you</span> : null}
      </span>
    </motion.div>
  );
}
