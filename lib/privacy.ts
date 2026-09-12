/**
 * Visibility rules and feature derivation (spec §7.4, §8.1).
 *
 * The one place that decides what a passport may show versus what the matching
 * engine may read. Components must never reach past this module.
 *
 * Pure module — no React, no browser APIs.
 */

import { QUESTION_BY_KEY } from "./questions";
import type {
  MeetingPreference,
  ProfileAnswer,
  ProjectRole,
  QuestionKey,
  StudentFeatures,
  Visibility,
} from "./types";

export const EMPTY_FEATURES: StudentFeatures = {
  academicInterests: [],
  movieGenres: [],
  sports: [],
  hobbies: [],
  skillsOffered: [],
  skillsWanted: [],
  projectRoles: [],
  languages: [],
  meetingPreference: "either",
};

/** Shown on the passport. */
export function isVisibleOnPassport(visibility: Visibility): boolean {
  return visibility === "public";
}

/** Readable by the matching engine. `private` answers never are. */
export function isUsableForMatching(visibility: Visibility): boolean {
  return visibility === "public" || visibility === "match_only";
}

function valuesFor(
  answers: readonly ProfileAnswer[],
  key: QuestionKey,
  filter: (v: Visibility) => boolean,
): string[] {
  const answer = answers.find((a) => a.questionKey === key);
  if (!answer || !filter(answer.visibility)) return [];
  const question = QUESTION_BY_KEY[key];
  // Free text is displayed but never scored (spec §8.1).
  if (question && !question.usedForMatching && filter === isUsableForMatching) return [];
  return answer.values;
}

/** Normalised features the matching engine is allowed to see. */
export function deriveFeatures(answers: readonly ProfileAnswer[]): StudentFeatures {
  const get = (key: QuestionKey) => valuesFor(answers, key, isUsableForMatching);
  const meeting = get("meetingPreference")[0] as MeetingPreference | undefined;
  return {
    academicInterests: get("academicInterests"),
    movieGenres: get("movieGenres"),
    sports: get("sports"),
    hobbies: get("hobbies"),
    skillsOffered: get("skillsOffered"),
    skillsWanted: get("skillsWanted"),
    projectRoles: get("projectRoles") as ProjectRole[],
    languages: get("languages"),
    meetingPreference: meeting ?? "either",
  };
}

/** What the passport is allowed to render. */
export function derivePublicAnswers(
  answers: readonly ProfileAnswer[],
): Partial<Record<QuestionKey, string[]>> {
  const out: Partial<Record<QuestionKey, string[]>> = {};
  for (const answer of answers) {
    if (!isVisibleOnPassport(answer.visibility)) continue;
    if (answer.values.length === 0) continue;
    out[answer.questionKey] = answer.values;
  }
  return out;
}

export function firstPublicValue(
  answers: readonly ProfileAnswer[],
  key: QuestionKey,
): string | undefined {
  return valuesFor(answers, key, isVisibleOnPassport)[0];
}

/** A student has "completed" their passport once they answer anything scoreable. */
export function hasCompletedPassport(answers: readonly ProfileAnswer[]): boolean {
  const f = deriveFeatures(answers);
  return (
    f.academicInterests.length +
      f.hobbies.length +
      f.skillsOffered.length +
      f.skillsWanted.length +
      f.movieGenres.length +
      f.sports.length >
    0
  );
}
