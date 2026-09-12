"use client";

import { motion, useReducedMotion } from "framer-motion";
import { avatarTextColor, initialsOf } from "@/lib/passport";
import type { Passport } from "@/lib/types";

/**
 * The student's avatar: initials on a flat brutalist disc with an ink rule and
 * deterministic orbital lines.
 *
 * Size is passed in by the caller and is always uniform within a given view —
 * node size never encodes anything about the person (spec §7.6).
 */
export function OrbitAvatar({
  passport,
  size = 132,
  animate = true,
  showRings = true,
}: {
  passport: Passport;
  size?: number;
  animate?: boolean;
  showRings?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { rings, tilt, fill } = passport.orbit;
  const center = size / 2;
  // With rings the disc is small and the rings fill the box; without them the
  // disc must fill the box itself.
  const core = size * (showRings ? 0.28 : 0.46);
  const shouldSpin = animate && !reduceMotion && showRings;
  const ink = "#221a1e";

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        className="absolute inset-0"
      >
        {showRings ? (
          <g transform={`rotate(${tilt} ${center} ${center})`}>
            {Array.from({ length: rings }).map((_, i) => {
              const outer = size / 2 - 1.5;
              const step = (outer - core - 2) / rings;
              const rx = core + 2 + (i + 1) * step;
              const ry = rx * (0.34 + i * 0.09);
              return (
                <ellipse
                  key={i}
                  cx={center}
                  cy={center}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={ink}
                  strokeWidth={1.5}
                  opacity={0.55}
                />
              );
            })}
          </g>
        ) : null}

        {/* Flat fill with a hard ink rule — no gradient. */}
        <circle
          cx={center}
          cy={center}
          r={core}
          fill={fill}
          stroke={ink}
          strokeWidth={size < 90 ? 2 : 2.5}
        />
      </svg>

      {shouldSpin ? (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          <span
            className="absolute"
            style={{
              width: size * 0.08,
              height: size * 0.08,
              left: center + core + (size / 2 - 2 - core) / 2 - size * 0.04,
              top: center - size * 0.04,
              background: ink,
            }}
          />
        </motion.div>
      ) : null}

      <span
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ fontSize: size * 0.2, color: avatarTextColor(fill) }}
      >
        {initialsOf(passport.student.displayName)}
      </span>
    </div>
  );
}
