/**
 * "Bridge the Class" group formation (spec §8.4).
 *
 * Greedy and deliberately modest. We do NOT claim optimality. The point is
 * that every group is (a) explainable and (b) biased toward including students
 * who have not yet made a confirmed introduction — without ever naming them as
 * isolated anywhere in the UI.
 *
 * Pure module — no React, no browser APIs.
 */

import { pairKey, scorePair, type Scorable } from "./matching";
import { PROJECT_ROLE_LABELS } from "./questions";
import type { ProjectRole } from "./types";

export type BridgeGroup = {
  id: string;
  memberIds: string[];
  /** Plain-language justification shown to the professor before publishing. */
  rationale: string[];
  rolesCovered: ProjectRole[];
  sharedThreads: string[];
};

export type BridgeOptions = {
  groupSize?: number;
  confirmedDegree?: Record<string, number>;
  /** Pairs already grouped or suggested together; discouraged, not forbidden. */
  recentPairs?: ReadonlySet<string>;
  /** Students who opted out of grouping. */
  excludeIds?: ReadonlySet<string>;
};

type Named = Scorable & { displayName: string };

export function bridgeTheClass(
  students: readonly Named[],
  options: BridgeOptions = {},
): BridgeGroup[] {
  const size = Math.max(2, options.groupSize ?? 3);
  const degrees = options.confirmedDegree ?? {};
  const recent = options.recentPairs ?? new Set<string>();
  const excluded = options.excludeIds ?? new Set<string>();

  const pool = students.filter((s) => !excluded.has(s.id));
  const byId = new Map(pool.map((s) => [s.id, s]));
  const nameOf = (id: string) => byId.get(id)?.displayName ?? id;

  // Least-connected first. Deterministic tie-break by id.
  const queue = [...pool].sort(
    (a, b) => (degrees[a.id] ?? 0) - (degrees[b.id] ?? 0) || a.id.localeCompare(b.id),
  );

  const assigned = new Set<string>();
  const groups: BridgeGroup[] = [];

  for (const seed of queue) {
    if (assigned.has(seed.id)) continue;
    if (pool.length - assigned.size < 2) break;

    const members: Named[] = [seed];
    assigned.add(seed.id);

    while (members.length < size) {
      const candidates = pool.filter((c) => !assigned.has(c.id));
      if (candidates.length === 0) break;

      let best: { student: Named; value: number } | null = null;
      for (const candidate of candidates) {
        const value = candidateValue(candidate, members, recent, degrees);
        if (!best || value > best.value || (value === best.value && candidate.id < best.student.id)) {
          best = { student: candidate, value };
        }
      }
      if (!best) break;
      members.push(best.student);
      assigned.add(best.student.id);
    }

    // A leftover of one gets folded into the previous group rather than left alone.
    if (members.length < 2 && groups.length > 0) {
      groups[groups.length - 1].memberIds.push(seed.id);
      continue;
    }

    groups.push(describeGroup(members, groups.length, nameOf));
  }

  return groups;
}

/**
 * How much a candidate improves a group. Shared ground matters, but so does
 * bringing a role nobody has yet — that is what stops groups collapsing into
 * "four builders who already sit together".
 */
function candidateValue(
  candidate: Named,
  members: readonly Named[],
  recent: ReadonlySet<string>,
  degrees: Record<string, number>,
): number {
  let total = 0;
  for (const member of members) {
    const { baseScore } = scorePair(member, candidate);
    // Some common ground is required, but we cap its pull so the highest-
    // scoring pair does not dominate every group.
    total += Math.min(baseScore, 8);
    if (recent.has(pairKey(member.id, candidate.id))) total -= 4;
  }
  total /= members.length;

  const rolesPresent = new Set(members.flatMap((m) => m.features.projectRoles));
  const addsRole = candidate.features.projectRoles.some((r) => !rolesPresent.has(r));
  if (addsRole) total += 3;

  // Complementary skills across the whole group.
  const wanted = new Set(members.flatMap((m) => m.features.skillsWanted));
  const offered = new Set(members.flatMap((m) => m.features.skillsOffered));
  if (candidate.features.skillsOffered.some((s) => wanted.has(s))) total += 2;
  if (candidate.features.skillsWanted.some((s) => offered.has(s))) total += 2;

  // Prefer students who have not made a confirmed introduction yet.
  if ((degrees[candidate.id] ?? 0) === 0) total += 2.5;

  return Math.round(total * 100) / 100;
}

function describeGroup(
  members: readonly Named[],
  index: number,
  nameOf: (id: string) => string,
): BridgeGroup {
  const rolesCovered = [...new Set(members.flatMap((m) => m.features.projectRoles))];
  const rationale: string[] = [];

  if (rolesCovered.length > 1) {
    rationale.push(
      `Covers ${rolesCovered.map((r) => PROJECT_ROLE_LABELS[r]).join(", ")}, so the work can actually be split.`,
    );
  }

  // Skill exchanges inside the group.
  const exchanges: string[] = [];
  for (const a of members) {
    for (const b of members) {
      if (a.id === b.id) continue;
      for (const skill of a.features.skillsOffered) {
        if (b.features.skillsWanted.includes(skill)) {
          exchanges.push(`${nameOf(a.id)} can help ${nameOf(b.id)} with ${skill}`);
        }
      }
    }
  }
  for (const line of [...new Set(exchanges)].slice(0, 2)) rationale.push(`${line}.`);

  // Something everyone can talk about.
  const sharedThreads = commonTags(members);
  if (sharedThreads.length > 0) {
    rationale.push(`Common ground to open with: ${sharedThreads.slice(0, 3).join(", ")}.`);
  } else {
    rationale.push("No overlap yet — this group is here to find one.");
  }

  return {
    id: `group_${index + 1}`,
    memberIds: members.map((m) => m.id),
    rationale,
    rolesCovered,
    sharedThreads,
  };
}

/** Tags held by at least two members of the group. */
function commonTags(members: readonly Named[]): string[] {
  const counts = new Map<string, number>();
  for (const m of members) {
    const tags = new Set([
      ...m.features.academicInterests,
      ...m.features.hobbies,
      ...m.features.movieGenres,
      ...m.features.sports,
    ]);
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}
