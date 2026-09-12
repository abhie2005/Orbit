"use client";

import { motion, useReducedMotion } from "framer-motion";
import { avatarTextColor, initialsOf } from "@/lib/passport";
import type { Passport } from "@/lib/types";

/**
 * The student's avatar: initials at the centre of a deterministic orbital
 * pattern. Size is passed in by the caller and is always uniform within a
 * given view — node size never encodes anything about the person.
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
  /** Rings are a passport flourish. At node scale they blur the circle's edge
   *  and make it ambiguous which label belongs to which student. */
  showRings?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { rings, tilt, hue } = passport.orbit;
  const center = size / 2;
  // With rings the core is small and the rings fill the box. Without them the
  // core must fill the box itself, otherwise the visible circle is half the
  // node's measured size and its name label appears to float away from it.
  const core = size * (showRings ? 0.26 : 0.46);
  const shouldSpin = animate && showRings && !reduceMotion;

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id={`core-${passport.student.id}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor={`hsl(${hue} 85% 78%)`} />
            <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 65% 52%)`} />
          </radialGradient>
        </defs>

        <g transform={`rotate(${tilt} ${center} ${center})`}>
          {(showRings ? Array.from({ length: rings }) : []).map((_, i) => {
            // Rings must stay inside the node's own box, otherwise they bleed
            // over neighbouring students in the constellation.
            const step = (size / 2 - 2 - core) / rings;
            const rx = core + (i + 1) * step;
            const ry = rx * (0.32 + i * 0.1);
            return (
              <ellipse
                key={i}
                cx={center}
                cy={center}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={`hsl(${(hue + i * 55) % 360} 70% 68%)`}
                strokeWidth={1.1}
                opacity={0.5}
              />
            );
          })}
        </g>

        <circle
          cx={center}
          cy={center}
          r={core}
          fill={`url(#core-${passport.student.id})`}
          stroke="rgba(21,22,26,0.3)"
        />
      </svg>

      {/* One small moon, the only moving element, and only when motion is allowed. */}
      {shouldSpin ? (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          <span
            className="absolute rounded-full"
            style={{
              width: size * 0.07,
              height: size * 0.07,
              left: center + core + (size / 2 - 2 - core) / 2 - size * 0.035,
              top: center - size * 0.035,
              background: `hsl(${(hue + 180) % 360} 90% 72%)`,
            }}
          />
        </motion.div>
      ) : null}

      <span
        className="absolute inset-0 flex items-center justify-center font-semibold"
        style={{ fontSize: size * 0.2, color: avatarTextColor(hue) }}
      >
        {initialsOf(passport.student.displayName)}
      </span>
    </div>
  );
}
