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
