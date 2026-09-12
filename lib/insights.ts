/**
 * Privacy-preserving class insights for the professor dashboard (spec §10).
 *
 * Everything here is an AGGREGATE. There is deliberately no function that
 * returns "students with no connections" — that list is exactly what the spec
 * forbids exposing, and the safest way to not leak it is to never build it.
 * The grouping algorithm uses degree counts internally and never renders them.
 *
 * Pure module — no React, no browser APIs.
 */

import { confirmedDegrees } from "./matching";
import { deriveFeatures, hasCompletedPassport } from "./privacy";
import { PROJECT_ROLE_LABELS } from "./questions";
import type { StudentRecord } from "./seed-data";
import type { BelongingPulse, Connection, ProjectRole } from "./types";

export type TagCount = { label: string; count: number };

export type ClassInsights = {
  studentCount: number;
  passportsCompleted: number;
  confirmedIntroductions: number;
  /** Share of students with at least one confirmed introduction, 0–1. */
  connectedShare: number;
  topInterests: TagCount[];
  skillsOffered: TagCount[];
  skillsWanted: TagCount[];
  /** Skills more people want to learn than can teach — a useful teaching signal. */
  skillGaps: TagCount[];
  roleDistribution: { role: ProjectRole; label: string; count: number }[];
  pulseBefore: PulseSummary | null;
  pulseAfter: PulseSummary | null;
};

export type PulseSummary = {
  responses: number;
  mean: number;
  /** Share answering 4 or 5 ("agree" / "strongly agree"), 0–1. */
  agreeShare: number;
  histogram: number[];
};

function tally(values: string[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const list of values) {
    for (const value of new Set(list)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

function topN(counts: Map<string, number>, n: number): TagCount[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

export function summarizePulse(pulses: readonly BelongingPulse[]): PulseSummary | null {
  if (pulses.length === 0) return null;
  const histogram = [0, 0, 0, 0, 0];
  let total = 0;
  for (const pulse of pulses) {
    histogram[pulse.score - 1] += 1;
    total += pulse.score;
  }
  const agree = histogram[3] + histogram[4];
  return {
    responses: pulses.length,
    mean: Math.round((total / pulses.length) * 100) / 100,
    agreeShare: agree / pulses.length,
    histogram,
  };
}

export function classInsights(
  students: readonly StudentRecord[],
  connections: readonly Connection[],
  pulses: readonly BelongingPulse[],
): ClassInsights {
  const featureList = students.map((r) => deriveFeatures(r.answers));

  const degrees = confirmedDegrees(
    students.map((r) => r.student.id),
    connections,
  );
  const connectedCount = Object.values(degrees).filter((d) => d > 0).length;

  const offered = tally(featureList.map((f) => f.skillsOffered));
  const wanted = tally(featureList.map((f) => f.skillsWanted));

  // Where demand outstrips supply — something a professor can actually act on.
  const gaps: TagCount[] = [...wanted.entries()]
    .map(([label, count]) => ({ label, count: count - (offered.get(label) ?? 0) }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 5);

  const roleCounts = tally(featureList.map((f) => f.projectRoles));
  const roleDistribution = (Object.keys(PROJECT_ROLE_LABELS) as ProjectRole[])
    .map((role) => ({
      role,
      label: PROJECT_ROLE_LABELS[role],
      count: roleCounts.get(role) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    studentCount: students.length,
    passportsCompleted: students.filter((r) => hasCompletedPassport(r.answers)).length,
    confirmedIntroductions: connections.filter((c) => c.status === "confirmed").length,
    connectedShare: students.length === 0 ? 0 : connectedCount / students.length,
    topInterests: topN(tally(featureList.map((f) => f.academicInterests)), 6),
    skillsOffered: topN(offered, 5),
    skillsWanted: topN(wanted, 5),
    skillGaps: gaps,
    roleDistribution,
    pulseBefore: summarizePulse(pulses.filter((p) => p.phase === "before")),
    pulseAfter: summarizePulse(pulses.filter((p) => p.phase === "after")),
  };
}
