/**
 * Deterministic passport visuals.
 *
 * Every student gets a distinctive orbital pattern, but it is derived purely
 * from their id — never random — so the same student always looks the same on
 * every device and across a demo reset.
 *
 * Pure module — no React, no browser APIs.
 */

import { deriveFeatures, firstPublicValue } from "./privacy";
import type { Passport, ProfileAnswer, Student } from "./types";

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A small deterministic pseudo-random sequence seeded by the student id. */
function sequence(seed: string, count: number): number[] {
  let state = hash(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out.push(state / 4294967296);
  }
  return out;
}

export function buildPassport(student: Student, answers: readonly ProfileAnswer[]): Passport {
  const [r1, r2, r3, r4, r5, r6] = sequence(student.avatarSeed, 6);
  return {
    student,
    home: firstPublicValue(answers, "home"),
    conversationStarter: firstPublicValue(answers, "conversationStarter"),
    features: deriveFeatures(answers),
    orbit: {
      rings: 2 + Math.floor(r1 * 3), // 2–4 rings
      tilt: Math.round(r2 * 70 - 35), // -35°–35°
      fill: AVATAR_FILLS[Math.floor(r3 * AVATAR_FILLS.length) % AVATAR_FILLS.length],
      stampRotations: [r4, r5, r6].map((v) => Math.round(v * 10 - 5)),
    },
  };
}

export function initialsOf(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Passport serial number. Looks official, means nothing, leaks nothing. */
export function serialFor(student: Student, courseCode: string): string {
  const n = hash(student.id) % 1000000;
  return `${courseCode.replace(/\s+/g, "")}-${String(n).padStart(6, "0")}`;
}

/* -------------------------------------------------------------------------- */

/**
 * Avatar fills. A fixed, restricted palette — brutalism does not do rainbows,
 * and a continuous hue wheel produced stray purples and washed-out pastels that
 * fought the wine/blue/amber/teal system.
 *
 * Every entry is dark enough that the paper-coloured initials clear 4.5:1, which
 * `npm run check:logic` asserts.
 */
export const AVATAR_FILLS = [
  "#6d2a3b", // wine
  "#1d4ed8", // blue
  "#9a5b06", // amber
  "#0f766e", // teal
  "#c2410c", // rust
  "#1e3a8a", // navy
  "#146c34", // green
  "#0e7490", // cyan
  "#b91c1c", // red
  "#456b0d", // olive
] as const;

const AVATAR_INK = "#15161a";
const AVATAR_PAPER = "#f7f2e8";

function relativeLuminance(hex: string): number {
  const v = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(ch[0]) + 0.7152 * f(ch[1]) + 0.0722 * f(ch[2]);
}

export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Initials take whichever of ink/paper reads better on the given fill, so no
 * student ends up with unreadable initials.
 */
export function avatarTextColor(fill: string): string {
  return contrastRatio(fill, AVATAR_PAPER) >= contrastRatio(fill, AVATAR_INK)
    ? AVATAR_PAPER
    : AVATAR_INK;
}
