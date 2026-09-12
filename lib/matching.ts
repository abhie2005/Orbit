/**
 * Deterministic, explainable matching (spec §8).
 *
 * Hard rules:
 *  - No randomness. Same input always produces the same graph.
 *  - No LLM. Scores come from explicit, student-entered tags only.
 *  - Every edge carries the reasons that produced it, so the UI can always
 *    answer "why am I being shown this person?" in plain language.
 *  - Nothing here ever reads a demographic attribute.
 *
 * Pure module — no React, no browser APIs.
 */

import type {
  Connection,
  EdgeCategoryMeta,
  MatchCategory,
  MatchReason,
  StudentFeatures,
} from "./types";

/** Spec §8.2 */
export const MATCH_WEIGHTS = {
  academicInterest: 3.0,
  hobby: 2.0,
  movieOrSport: 1.5,
  complementarySkill: 3.5,
  language: 1.0,
  compatibleMeeting: 1.0,
  lowConnectionBoost: 2.5,
  repeatedPairingPenalty: 2.0,
} as const;

/** An edge is drawn only above this score, so weak coincidences stay invisible. */
export const MIN_EDGE_SCORE = 3.0;

/**
 * Each student keeps their best `TOP_EDGES_PER_STUDENT` edges. The final graph
 * is the *union* of those sets, which guarantees a student with very little in
 * common still keeps their single strongest edge instead of being dropped.
 */
export const TOP_EDGES_PER_STUDENT = 4;

export type Scorable = {
  id: string;
  features: StudentFeatures;
};

export type ScoreContext = {
  /** Confirmed-introduction count per student id. Drives the low-connection boost. */
  confirmedDegree?: Record<string, number>;
  /** Pair keys ("a|b", sorted) that were recently suggested or grouped together. */
  recentPairs?: ReadonlySet<string>;
};

export type PairScore = {
  /** Content-only score. Stable regardless of who has met whom. */
  baseScore: number;
  /** baseScore plus contextual nudges (low-connection boost, repeat penalty). */
  score: number;
  reasons: MatchReason[];
  breakdown: {
    academic: number;
    hobby: number;
    movieOrSport: number;
    complementarySkill: number;
    language: number;
    meeting: number;
    lowConnectionBoost: number;
    repeatedPairingPenalty: number;
  };
};

export const EDGE_CATEGORIES: Record<MatchCategory, EdgeCategoryMeta> = {
  academic: {
    category: "academic",
    label: "Shared interest",
    colorVar: "var(--orbit-blue)",
    dashArray: "0",
    description: "A subject or technology you both chose.",
  },
  social: {
    category: "social",
    label: "Shared pastime",
    colorVar: "var(--orbit-amber)",
    dashArray: "1 6",
    description: "A hobby, sport, or genre you both enjoy.",
  },
  complementary_skill: {
    category: "complementary_skill",
    label: "Skill exchange",
    colorVar: "var(--orbit-wine)",
    dashArray: "10 5",
    description: "One of you can teach what the other wants to learn.",
  },
  language: {
    category: "language",
    label: "Shared language",
    colorVar: "var(--orbit-green)",
    dashArray: "2 4 8 4",
    description: "A language you both listed.",
  },
};

/** Stable, order-independent key for a pair of students. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function intersect(a: readonly string[], b: readonly string[]): string[] {
  const setB = new Set(b);
  // Preserve `a`'s order so output is deterministic, then sort for stability.
  return a.filter((value) => setB.has(value)).sort();
}

/**
 * Score one pair. Returns the reasons alongside the number so a caller can
 * never end up with a score it cannot explain.
 */
export function scorePair(a: Scorable, b: Scorable, ctx: ScoreContext = {}): PairScore {
  const reasons: MatchReason[] = [];

  const sharedAcademic = intersect(a.features.academicInterests, b.features.academicInterests);
  for (const label of sharedAcademic) {
    reasons.push({ category: "academic", label, weight: MATCH_WEIGHTS.academicInterest });
  }

  const sharedHobbies = intersect(a.features.hobbies, b.features.hobbies);
  for (const label of sharedHobbies) {
    reasons.push({ category: "social", label, weight: MATCH_WEIGHTS.hobby });
  }

  const sharedGenres = intersect(a.features.movieGenres, b.features.movieGenres);
  const sharedSports = intersect(a.features.sports, b.features.sports);
  for (const label of [...sharedGenres, ...sharedSports]) {
    reasons.push({ category: "social", label, weight: MATCH_WEIGHTS.movieOrSport });
  }

  // Complementary skills: one student offers exactly what the other wants.
  const aTeaches = intersect(a.features.skillsOffered, b.features.skillsWanted);
  const bTeaches = intersect(b.features.skillsOffered, a.features.skillsWanted);
  for (const label of aTeaches) {
    reasons.push({
      category: "complementary_skill",
      label,
      weight: MATCH_WEIGHTS.complementarySkill,
      direction: { providerId: a.id, learnerId: b.id },
    });
  }
  for (const label of bTeaches) {
    reasons.push({
      category: "complementary_skill",
      label,
      weight: MATCH_WEIGHTS.complementarySkill,
      direction: { providerId: b.id, learnerId: a.id },
    });
  }

  const sharedLanguages = intersect(a.features.languages, b.features.languages);
  for (const label of sharedLanguages) {
    reasons.push({ category: "language", label, weight: MATCH_WEIGHTS.language });
  }

  const academic = sharedAcademic.length * MATCH_WEIGHTS.academicInterest;
  const hobby = sharedHobbies.length * MATCH_WEIGHTS.hobby;
  const movieOrSport =
    (sharedGenres.length + sharedSports.length) * MATCH_WEIGHTS.movieOrSport;
  const complementarySkill =
    (aTeaches.length + bTeaches.length) * MATCH_WEIGHTS.complementarySkill;
  const language = sharedLanguages.length * MATCH_WEIGHTS.language;

  // Meeting preference only rewards an existing connection; it never creates one.
  const meetingCompatible =
    a.features.meetingPreference === "either" ||
    b.features.meetingPreference === "either" ||
    a.features.meetingPreference === b.features.meetingPreference;
  const meeting =
    meetingCompatible && reasons.length > 0 ? MATCH_WEIGHTS.compatibleMeeting : 0;

  const baseScore = academic + hobby + movieOrSport + complementarySkill + language + meeting;

  // Contextual nudges. These affect *ranking of suggestions*, never whether a
  // structural edge exists, so the graph itself stays stable as people meet.
  const degrees = ctx.confirmedDegree ?? {};
  const minDegree = Math.min(degrees[a.id] ?? 0, degrees[b.id] ?? 0);
  const lowConnectionBoost =
    reasons.length > 0 && minDegree === 0 ? MATCH_WEIGHTS.lowConnectionBoost : 0;

  const repeatedPairingPenalty = ctx.recentPairs?.has(pairKey(a.id, b.id))
    ? MATCH_WEIGHTS.repeatedPairingPenalty
    : 0;

  return {
    baseScore: round(baseScore),
    score: round(baseScore + lowConnectionBoost - repeatedPairingPenalty),
    reasons: sortReasons(reasons),
    breakdown: {
      academic,
      hobby,
      movieOrSport,
      complementarySkill,
      language,
      meeting,
      lowConnectionBoost,
      repeatedPairingPenalty,
    },
  };
}

/** Strongest reasons first; deterministic tie-break by category then label. */
function sortReasons(reasons: MatchReason[]): MatchReason[] {
  const categoryRank: Record<MatchCategory, number> = {
    complementary_skill: 0,
    academic: 1,
    social: 2,
    language: 3,
  };
  return [...reasons].sort(
    (x, y) =>
      y.weight - x.weight ||
      categoryRank[x.category] - categoryRank[y.category] ||
      x.label.localeCompare(y.label),
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export type BuildConstellationOptions = {
  minScore?: number;
  topEdgesPerStudent?: number;
  /** Preserve status (confirmed / dismissed) from a previous build. */
  existing?: readonly Connection[];
};

/**
 * Build the classroom graph. Deterministic: same students in, same edges out,
 * regardless of array order.
 */
export function buildConstellation(
  classroomId: string,
  students: readonly Scorable[],
  options: BuildConstellationOptions = {},
): Connection[] {
  const minScore = options.minScore ?? MIN_EDGE_SCORE;
  const topN = options.topEdgesPerStudent ?? TOP_EDGES_PER_STUDENT;

  const ordered = [...students].sort((a, b) => a.id.localeCompare(b.id));
  const scored = new Map<string, { a: string; b: string; result: PairScore }>();

  for (let i = 0; i < ordered.length; i += 1) {
    for (let j = i + 1; j < ordered.length; j += 1) {
      const a = ordered[i];
      const b = ordered[j];
      const result = scorePair(a, b);
      if (result.reasons.length === 0 || result.baseScore < minScore) continue;
      scored.set(pairKey(a.id, b.id), { a: a.id, b: b.id, result });
    }
  }

  // Keep each student's top N candidates, then take the union of those keeps.
  const byStudent = new Map<string, string[]>();
  for (const [key, entry] of scored) {
    for (const id of [entry.a, entry.b]) {
      const list = byStudent.get(id) ?? [];
      list.push(key);
      byStudent.set(id, list);
    }
  }

  const keep = new Set<string>();
  for (const [, keys] of [...byStudent].sort((x, y) => x[0].localeCompare(y[0]))) {
    const ranked = keys.sort((x, y) => {
      const sx = scored.get(x)!.result.baseScore;
      const sy = scored.get(y)!.result.baseScore;
      return sy - sx || x.localeCompare(y);
    });
    for (const key of ranked.slice(0, topN)) keep.add(key);
  }

  const previousStatus = new Map(
    (options.existing ?? []).map((c) => [
      pairKey(c.studentAId, c.studentBId),
      c.status,
    ]),
  );

  return [...keep]
    .sort()
    .map((key) => {
      const entry = scored.get(key)!;
      return {
        id: `conn_${key.replace("|", "_")}`,
        classroomId,
        studentAId: entry.a,
        studentBId: entry.b,
        score: entry.result.baseScore,
        reasons: entry.result.reasons,
        status: previousStatus.get(key) ?? "suggested",
      } satisfies Connection;
    })
    .sort((x, y) => y.score - x.score || x.id.localeCompare(y.id));
}

/**
 * Rank the best *unmet* people for one student. This is what missions use, so
 * the low-connection boost and repeat penalty apply here.
 */
export function rankSuggestionsFor(
  studentId: string,
  students: readonly Scorable[],
  ctx: ScoreContext = {},
  excludeIds: ReadonlySet<string> = new Set(),
): { studentId: string; score: number; reasons: MatchReason[] }[] {
  const me = students.find((s) => s.id === studentId);
  if (!me) return [];
  return students
    .filter((s) => s.id !== studentId && !excludeIds.has(s.id))
    .map((other) => {
      const result = scorePair(me, other, ctx);
      return { studentId: other.id, score: result.score, reasons: result.reasons };
    })
    .filter((entry) => entry.reasons.length > 0)
    .sort((a, b) => b.score - a.score || a.studentId.localeCompare(b.studentId));
}

/**
 * Turn reasons into plain sentences. `perspectiveId` makes the copy
 * second-person for the student currently looking at the edge.
 */
export function explainReasons(
  reasons: readonly MatchReason[],
  names: Record<string, string>,
  perspectiveId?: string,
  limit = 3,
): string[] {
  const nameOf = (id: string) => (id === perspectiveId ? "You" : (names[id] ?? "They"));
  return reasons.slice(0, limit).map((reason) => {
    switch (reason.category) {
      case "complementary_skill": {
        if (!reason.direction) return `Skill exchange around ${reason.label}.`;
        const provider = nameOf(reason.direction.providerId);
        const learner = nameOf(reason.direction.learnerId);
        const wants = learner === "You" ? "you want" : `${learner} wants`;
        const helps = provider === "You" ? "you can help with" : `${provider} can help with`;
        return `${capitalize(wants)} to learn ${reason.label}, a skill ${helps}.`;
      }
      case "academic":
        return `You both chose ${reason.label} as an interest.`;
      case "social":
        return `You both enjoy ${reason.label}.`;
      case "language":
        return `You both speak ${reason.label}.`;
    }
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** One-line summary used on cards and in the accessible list view. */
export function summarizeConnection(
  reasons: readonly MatchReason[],
  names: Record<string, string>,
  perspectiveId?: string,
): string {
  const sentences = explainReasons(reasons, names, perspectiveId, 2);
  if (sentences.length === 0) return "No shared answers yet.";
  return sentences.join(" ");
}

/** Confirmed-introduction counts. Internal only — never rendered to students. */
export function confirmedDegrees(
  studentIds: readonly string[],
  connections: readonly Connection[],
): Record<string, number> {
  const degrees: Record<string, number> = Object.fromEntries(
    studentIds.map((id) => [id, 0]),
  );
  for (const c of connections) {
    if (c.status !== "confirmed") continue;
    if (c.studentAId in degrees) degrees[c.studentAId] += 1;
    if (c.studentBId in degrees) degrees[c.studentBId] += 1;
  }
  return degrees;
}
