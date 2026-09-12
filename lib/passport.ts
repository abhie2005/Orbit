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
      hue: Math.round(r3 * 360),
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

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0]
    : hp < 2 ? [x, c, 0]
    : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c]
    : hp < 5 ? [x, 0, c]
    : [c, 0, x];
  const m = l - c / 2;
  return [r1 + m, g1 + m, b1 + m];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const AVATAR_INK = "#0b0f1c";
const AVATAR_PAPER = "#f7f2e8";

/**
 * Initials must stay legible on an orb whose hue is derived from the student
 * id — a deep blue orb and a pale yellow one cannot share a text colour.
 * Picks whichever of ink/paper has the better contrast against the gradient
 * midpoint, so no student ends up with unreadable initials.
 */
export function avatarTextColor(hue: number): string {
  const midpoint = relativeLuminance(hslToRgb((hue + 20) % 360, 0.75, 0.62));
  const contrast = (a: number, b: number) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const inkLum = relativeLuminance(hslToRgb(230, 0.47, 0.08));
  const paperLum = relativeLuminance(hslToRgb(40, 0.43, 0.94));
  return contrast(midpoint, inkLum) >= contrast(midpoint, paperLum)
    ? AVATAR_INK
    : AVATAR_PAPER;
}
