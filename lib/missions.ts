/**
 * Connection missions and conversation starters (spec §7.7, §9).
 *
 * Every prompt here is a deterministic template built from an explicit shared
 * answer. No model is required for the app to work; an LLM may later *rephrase*
 * one of these strings, but it may never invent the connection behind it.
 *
 * Pure module — no React, no browser APIs.
 */

import { explainReasons, rankSuggestionsFor, type ScoreContext, type Scorable } from "./matching";
import type { MatchReason, Mission } from "./types";

/** Hand-written openers for tags that deserve better than a generic question. */
const PROMPT_LIBRARY: Record<string, string> = {
  "Science Fiction":
    "If you could build one science-fiction technology for real, what would it be?",
  Anime: "What is the one anime you would make someone watch to get them into it?",
  Documentary: "What documentary changed your mind about something?",
  Animation: "What animated film do you think adults massively underrate?",
  Comedy: "What is something that makes you laugh that nobody else finds funny?",
  Gaming: "What game did you sink the most hours into, and was it worth it?",
  "Strategy Games": "What is your opening move in the game you play best?",
  Chess: "Are you an opening person or an endgame person?",
  Photography: "What is the last photo you took that you actually liked?",
  Cooking: "What is your twenty-minute, no-plan, works-every-time meal?",
  Coffee: "Where is the best coffee within walking distance of campus?",
  Travel: "Where is the next place you want to go, and why that one?",
  Music: "What have you had on repeat this week?",
  Poetry: "Who should more people be reading?",
  Reading: "What book do you recommend to people constantly?",
  Drawing: "What do you draw when you are not trying to make anything good?",
  Gardening: "What have you managed to keep alive the longest?",
  Volunteering: "What got you started with that?",
  Podcasts: "What episode do you send people?",
  Crafts: "What are you making right now?",
  "Film Making": "What is the shot you are proudest of?",
  Cricket: "Test match or T20, and defend your answer.",
  Basketball: "Who are you watching this season?",
  Badminton: "Singles or doubles, and are you any good?",
  Soccer: "Who do you support, and how much suffering has it caused?",
  Running: "What distance do you actually enjoy, not just survive?",
  Hiking: "What is the best trail you have done?",
  "Formula 1": "Which race would you fly to see in person?",
  Volleyball: "Are you the one who sets or the one who spikes?",
  Dance: "What style, and how did you get into it?",
  Yoga: "Morning practice or evening practice?",
  Cycling: "Commuter or weekend-ride person?",
  "Gym & Fitness": "What are you training toward right now?",
  Swimming: "Pool or open water?",
  Tennis: "Who do you watch, and who do you play like?",
  "Table Tennis": "Is there a table on campus worth finding?",
};

const ACADEMIC_TEMPLATES = [
  "What got you into {label} in the first place?",
  "What is the most interesting thing you have built or read about in {label}?",
  "If you had a free week to work on {label}, what would you make?",
];

const SKILL_TEMPLATES = [
  "How did you get started with {label}, and what would you tell someone on day one?",
  "What is the one thing about {label} you wish someone had told you earlier?",
];

const LANGUAGE_TEMPLATE =
  "What is a word or phrase in {label} that does not translate well into English?";

const SOCIAL_FALLBACK = "How did you get into {label}?";

/**
 * Deterministic index so the same pair always gets the same prompt — no
 * randomness anywhere in Orbit.
 */
function stableIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % modulo;
}

function fill(template: string, label: string): string {
  return template.replace("{label}", label);
}

/** Build a conversation starter from the single strongest explicit reason. */
export function conversationStarter(reasons: readonly MatchReason[], seed: string): string {
  const reason = reasons[0];
  if (!reason) return "What made you pick this class?";

  switch (reason.category) {
    case "complementary_skill":
      return fill(
        SKILL_TEMPLATES[stableIndex(seed, SKILL_TEMPLATES.length)],
        reason.label,
      );
    case "academic":
      return fill(
        ACADEMIC_TEMPLATES[stableIndex(seed, ACADEMIC_TEMPLATES.length)],
        reason.label,
      );
    case "language":
      return fill(LANGUAGE_TEMPLATE, reason.label);
    case "social":
      return PROMPT_LIBRARY[reason.label] ?? fill(SOCIAL_FALLBACK, reason.label);
  }
}

export type MissionInput = {
  classroomId: string;
  studentId: string;
  students: readonly (Scorable & { displayName: string })[];
  /** Students already met or dismissed — never suggested again. */
  excludeIds?: ReadonlySet<string>;
  ctx?: ScoreContext;
};

/**
 * The next best mission for one student. Returns null when there is genuinely
 * nobody left to suggest, which the UI renders as a warm empty state rather
 * than an error.
 */
export function nextMissionFor(input: MissionInput): Mission | null {
  const { classroomId, studentId, students, excludeIds = new Set(), ctx = {} } = input;
  const names = Object.fromEntries(students.map((s) => [s.id, s.displayName]));

  const ranked = rankSuggestionsFor(studentId, students, ctx, excludeIds);
  const best = ranked[0];
  if (!best) return null;

  const partnerName = names[best.studentId] ?? "a classmate";
  const seed = `${studentId}:${best.studentId}`;
  const prompt = conversationStarter(best.reasons, seed);
  const [reason] = explainReasons(best.reasons, names, studentId, 1);

  return {
    id: `mission_${studentId}_${best.studentId}`,
    classroomId,
    participantIds: [studentId, best.studentId],
    title: `Meet ${partnerName}`,
    prompt: `Meet ${partnerName} and ask: ${prompt}`,
    reason: reason ?? "You have something in common.",
    connectionId: undefined,
    status: "active",
  };
}

/** A short queue of missions so "suggest someone else" always has an answer. */
export function missionQueueFor(input: MissionInput, count = 3): Mission[] {
  const { classroomId, studentId, students, excludeIds = new Set(), ctx = {} } = input;
  const names = Object.fromEntries(students.map((s) => [s.id, s.displayName]));
  const ranked = rankSuggestionsFor(studentId, students, ctx, excludeIds).slice(0, count);

  return ranked.map((entry) => {
    const partnerName = names[entry.studentId] ?? "a classmate";
    const seed = `${studentId}:${entry.studentId}`;
    const [reason] = explainReasons(entry.reasons, names, studentId, 1);
    return {
      id: `mission_${studentId}_${entry.studentId}`,
      classroomId,
      participantIds: [studentId, entry.studentId],
      title: `Meet ${partnerName}`,
      prompt: `Meet ${partnerName} and ask: ${conversationStarter(entry.reasons, seed)}`,
      reason: reason ?? "You have something in common.",
      status: "active" as const,
    };
  });
}
