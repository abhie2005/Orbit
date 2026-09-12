/**
 * The Orbit assistant.
 *
 * Deterministic and grounded: every answer is computed from the same explicit,
 * student-entered tags the constellation is built from. There is no model call
 * and no API key — AGENTS.md rule 2 says the app must be fully functional with
 * zero keys configured, and an assistant that invents a classmate is worse than
 * no assistant at all.
 *
 * An LLM could later rephrase these strings. It must never choose who is named.
 *
 * Pure module — no React, no browser APIs.
 */

import { bridgeTheClass, type BridgeGroup } from "./grouping";
import { explainReasons, rankSuggestionsFor, type Scorable } from "./matching";
import { deriveFeatures } from "./privacy";
import { HOBBIES, LANGUAGES, PROJECT_ROLE_LABELS, SKILLS, ACADEMIC_INTERESTS } from "./questions";
import type { StudentRecord } from "./seed-data";
import type { Connection, ProjectRole } from "./types";

/**
 * Everyday words mapped onto the controlled vocabulary. This is what lets
 * someone type "react" or "sql" and still get a grounded answer, without
 * guessing at anything the student did not actually select.
 */
const SYNONYMS: Record<string, string> = {
  react: "Frontend Development",
  frontend: "Frontend Development",
  "front end": "Frontend Development",
  "front-end": "Frontend Development",
  css: "Frontend Development",
  html: "Frontend Development",
  tailwind: "Frontend Development",
  nextjs: "Frontend Development",
  "next.js": "Frontend Development",
  "ui/ux": "UI/UX Design",
  "ui ux": "UI/UX Design",
  ui: "UI/UX Design",
  ux: "UI/UX Design",
  design: "UI/UX Design",
  figma: "UI/UX Design",
  backend: "Backend Development",
  "back end": "Backend Development",
  "back-end": "Backend Development",
  api: "Backend Development",
  node: "Backend Development",
  "node.js": "Backend Development",
  express: "Backend Development",
  server: "Backend Development",
  sql: "Databases",
  database: "Databases",
  databases: "Databases",
  postgres: "Databases",
  mongo: "Databases",
  ml: "Machine Learning",
  ai: "Machine Learning",
  "machine learning": "Machine Learning",
  pytorch: "Machine Learning",
  tensorflow: "Machine Learning",
  python: "Python",
  pandas: "Python",
  cloud: "Cloud Computing",
  aws: "Cloud Computing",
  azure: "Cloud Computing",
  gcp: "Cloud Computing",
  devops: "Cloud Computing",
  docker: "Cloud Computing",
  kubernetes: "Cloud Computing",
  security: "Cybersecurity",
  cyber: "Cybersecurity",
  pentest: "Cybersecurity",
  mobile: "Mobile Development",
  ios: "Mobile Development",
  android: "Mobile Development",
  "react native": "Mobile Development",
  flutter: "Mobile Development",
  swift: "Mobile Development",
  chart: "Data Visualization",
  charts: "Data Visualization",
  dashboard: "Data Visualization",
  d3: "Data Visualization",
  viz: "Data Visualization",
  visualisation: "Data Visualization",
  visualization: "Data Visualization",
  writing: "Technical Writing",
  docs: "Technical Writing",
  documentation: "Technical Writing",
  report: "Technical Writing",
  present: "Presentation Skills",
  presentation: "Presentation Skills",
  slides: "Presentation Skills",
  demo: "Presentation Skills",
  speaking: "Public Speaking",
  speak: "Public Speaking",
  pitch: "Pitching",
  pitching: "Pitching",
  research: "Research",
  "user research": "Research",
  interviews: "Research",
  pm: "Project Organization",
  planning: "Project Organization",
  organise: "Project Organization",
  organize: "Project Organization",
  "project management": "Project Organization",
  hardware: "Hardware & Electronics",
  arduino: "Hardware & Electronics",
  robotics: "Hardware & Electronics",
  electronics: "Hardware & Electronics",
  video: "Video Editing",
  editing: "Video Editing",
  animation: "Animation",
  animate: "Animation",
  game: "Game Design",
  games: "Game Design",
  unity: "Game Design",
  gamedev: "Game Design",
};

/** Longest-first so "machine learning" wins over "learning". */
const SYNONYM_KEYS = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);

const ALL_SKILLS: readonly string[] = SKILLS;
const ALL_INTERESTS: readonly string[] = ACADEMIC_INTERESTS;
const ALL_HOBBIES: readonly string[] = HOBBIES;
const ALL_LANGUAGES: readonly string[] = LANGUAGES;

/**
 * Normalise to space-delimited words so matching is punctuation-proof.
 * "frontend?" and "frontend," must both match the word "frontend" — an earlier
 * version required literal surrounding spaces and silently missed every
 * question that ended in a question mark.
 */
function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    // Keep "." only between alphanumerics so "node.js" survives but the full
    // stop in "Postgres." does not swallow the word.
    .replace(/\.(?![a-z0-9])/g, " ")
    .replace(/(?<![a-z0-9])\./g, " ")
    .replace(/[^a-z0-9+#./&-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function containsPhrase(haystack: string, phrase: string): boolean {
  return haystack.includes(` ${normalise(phrase).trim()} `);
}

function matchVocabulary(text: string, vocabulary: readonly string[]): string[] {
  const haystack = normalise(text);
  const found = new Set<string>();
  for (const term of vocabulary) {
    if (containsPhrase(haystack, term)) found.add(term);
  }
  return [...found];
}

/** Everything in the controlled vocabulary this text refers to. */
export function extractSkills(text: string): string[] {
  const haystack = normalise(text);
  const found = new Set<string>(matchVocabulary(text, ALL_SKILLS));
  for (const key of SYNONYM_KEYS) {
    if (containsPhrase(haystack, key)) found.add(SYNONYMS[key]);
  }
  return [...found];
}

export type AssistantPerson = {
  id: string;
  name: string;
  why: string;
};

export type AssistantAnswer = {
  text: string;
  people: AssistantPerson[];
  groups?: BridgeGroup[];
  /** Terms the assistant actually matched, so the UI can show its working. */
  matched: string[];
};

export type AssistantContext = {
  students: readonly StudentRecord[];
  connections: readonly Connection[];
  currentStudentId: string | null;
};

function scorables(students: readonly StudentRecord[]): (Scorable & { displayName: string })[] {
  return students.map((r) => ({
    id: r.student.id,
    displayName: r.student.displayName,
    features: deriveFeatures(r.answers),
  }));
}

const HELP_TEXT = `Ask me things like:
• "Who can help me with frontend?"
• "Who wants to learn Python?"
• "Who else is into machine learning?"
• "Who should I talk to next?"
• "Who speaks Spanish?"

I only ever name people from what they chose to share, and I always say why.`;

/**
 * Answer a student's question. Never invents a person and never ranks anyone —
 * results are ordered by how well the explicit tags match, nothing else.
 */
export function answerStudentQuestion(
  question: string,
  ctx: AssistantContext,
): AssistantAnswer {
  const q = question.toLowerCase().trim();
  if (!q) return { text: HELP_TEXT, people: [], matched: [] };

  const people = scorables(ctx.students);
  const byId = new Map(people.map((p) => [p.id, p]));
  const meId = ctx.currentStudentId;
  const isNotMe = (id: string) => id !== meId;

  const skills = extractSkills(question);
  const interests = matchVocabulary(question, ALL_INTERESTS);
  const hobbies = matchVocabulary(question, ALL_HOBBIES);
  const languages = matchVocabulary(question, ALL_LANGUAGES);
  const matched = [...new Set([...skills, ...interests, ...hobbies, ...languages])];

  const wantsToLearn = /\b(want|wants|wanting|learn|learning|looking to)\b/.test(q);
  const asksForHelp = /\b(help|helps|teach|teaches|mentor|stuck|doubt|doubts|question)\b/.test(q);
  const asksWhoNext = /\b(who should i|talk to|reach out|meet next|next)\b/.test(q);
  const asksRole = /\b(builder|researcher|designer|organizer|organiser|writer|presenter)\b/.test(q);

  // "Who wants to learn X?"
  if (skills.length > 0 && wantsToLearn && !asksForHelp) {
    const results = people
      .filter((p) => isNotMe(p.id) && p.features.skillsWanted.some((s) => skills.includes(s)))
      .map((p) => ({
        id: p.id,
        name: p.displayName,
        why: `Listed ${p.features.skillsWanted.filter((s) => skills.includes(s)).join(" and ")} as something they want to learn.`,
      }));
    return {
      text: results.length
        ? `${results.length} ${results.length === 1 ? "person wants" : "people want"} to learn ${skills.join(" or ")}.`
        : `Nobody has listed ${skills.join(" or ")} as something they want to learn yet.`,
      people: results,
      matched,
    };
  }

  // "Who can help me with X?" — the headline case.
  if (skills.length > 0) {
    const results = people
      .filter((p) => isNotMe(p.id) && p.features.skillsOffered.some((s) => skills.includes(s)))
      .map((p) => {
        const offered = p.features.skillsOffered.filter((s) => skills.includes(s));
        const alsoShared = meId
          ? p.features.academicInterests.filter((i) =>
              byId.get(meId)?.features.academicInterests.includes(i),
            )
          : [];
        const extra = alsoShared.length ? ` You also both chose ${alsoShared[0]}.` : "";
        return {
          id: p.id,
          name: p.displayName,
          why: `Offered to help with ${offered.join(" and ")}.${extra}`,
        };
      });
    return {
      text: results.length
        ? `${results.length} ${results.length === 1 ? "person" : "people"} offered to help with ${skills.join(" or ")}. Any of them is a reasonable person to ask.`
        : `Nobody has offered ${skills.join(" or ")} yet. Try the professor, or ask who wants to learn it with you.`,
      people: results,
      matched,
    };
  }

  // Shared interests and pastimes.
  if (interests.length > 0 || hobbies.length > 0) {
    const tags = [...interests, ...hobbies];
    const results = people
      .filter(
        (p) =>
          isNotMe(p.id) &&
          [...p.features.academicInterests, ...p.features.hobbies, ...p.features.sports].some((t) =>
            tags.includes(t),
          ),
      )
      .map((p) => {
        const hits = [...p.features.academicInterests, ...p.features.hobbies, ...p.features.sports]
          .filter((t) => tags.includes(t));
        return { id: p.id, name: p.displayName, why: `Also chose ${hits.join(" and ")}.` };
      });
    return {
      text: results.length
        ? `${results.length} ${results.length === 1 ? "person is" : "people are"} into ${tags.join(" or ")}.`
        : `Nobody else has chosen ${tags.join(" or ")} yet.`,
      people: results,
      matched,
    };
  }

  if (languages.length > 0) {
    const results = people
      .filter((p) => isNotMe(p.id) && p.features.languages.some((l) => languages.includes(l)))
      .map((p) => ({
        id: p.id,
        name: p.displayName,
        why: `Speaks ${p.features.languages.filter((l) => languages.includes(l)).join(" and ")}.`,
      }));
    return {
      text: results.length
        ? `${results.length} ${results.length === 1 ? "person speaks" : "people speak"} ${languages.join(" or ")}.`
        : `Nobody has listed ${languages.join(" or ")}.`,
      people: results,
      matched,
    };
  }

  if (asksRole) {
    const role = (Object.keys(PROJECT_ROLE_LABELS) as ProjectRole[]).find((r) => q.includes(r));
    if (role) {
      const results = people
        .filter((p) => isNotMe(p.id) && p.features.projectRoles.includes(role))
        .map((p) => ({
          id: p.id,
          name: p.displayName,
          why: `Prefers to work as a ${PROJECT_ROLE_LABELS[role].toLowerCase()}.`,
        }));
      return {
        text: `${results.length} ${results.length === 1 ? "person prefers" : "people prefer"} the ${PROJECT_ROLE_LABELS[role].toLowerCase()} role.`,
        people: results,
        matched: [PROJECT_ROLE_LABELS[role]],
      };
    }
  }

  // "Who should I talk to next?"
  if (asksWhoNext || asksForHelp) {
    if (!meId) {
      return {
        text: "Join the class first and I can suggest someone from your own answers.",
        people: [],
        matched,
      };
    }
    const names = Object.fromEntries(people.map((p) => [p.id, p.displayName]));
    const met = new Set<string>();
    for (const c of ctx.connections) {
      if (c.status !== "confirmed") continue;
      if (c.studentAId === meId) met.add(c.studentBId);
      if (c.studentBId === meId) met.add(c.studentAId);
    }
    const results = rankSuggestionsFor(meId, people, {}, met)
      .slice(0, 4)
      .map((entry) => ({
        id: entry.studentId,
        name: names[entry.studentId] ?? "Classmate",
        why: explainReasons(entry.reasons, names, meId, 1)[0] ?? "You have something in common.",
      }));
    return {
      text: results.length
        ? "Based on what you both chose, these are worth a conversation."
        : "You have met everyone I can explain a reason for. That is a good problem.",
      people: results,
      matched,
    };
  }

  return { text: HELP_TEXT, people: [], matched: [] };
}

export type AssignmentPlan = {
  skills: string[];
  groups: BridgeGroup[];
  text: string;
};

/**
 * Professor flow: read an assignment brief, pull the skills it actually names,
 * and form groups that cover them — still preferring students who have not made
 * a confirmed introduction yet.
 */
export function planAssignmentGroups(
  brief: string,
  ctx: AssistantContext,
  options: { groupSize?: number } = {},
): AssignmentPlan {
  const skills = extractSkills(brief);
  const people = scorables(ctx.students);

  const degrees: Record<string, number> = Object.fromEntries(people.map((p) => [p.id, 0]));
  for (const c of ctx.connections) {
    if (c.status !== "confirmed") continue;
    if (c.studentAId in degrees) degrees[c.studentAId] += 1;
    if (c.studentBId in degrees) degrees[c.studentBId] += 1;
  }

  const groups = bridgeTheClass(people, {
    groupSize: options.groupSize ?? 4,
    confirmedDegree: degrees,
    prioritySkills: new Set(skills),
  });

  const covered = new Set(
    groups.flatMap((g) =>
      g.memberIds.flatMap((id) => {
        const p = people.find((x) => x.id === id);
        return p ? p.features.skillsOffered.filter((s) => skills.includes(s)) : [];
      }),
    ),
  );
  const missing = skills.filter((s) => !covered.has(s));

  const text = skills.length
    ? `I found ${skills.length} skill${skills.length === 1 ? "" : "s"} in this brief: ${skills.join(", ")}. Here are ${groups.length} groups built to cover them.${
        missing.length
          ? ` Nobody in the class has offered ${missing.join(" or ")} — worth a workshop before this is due.`
          : ""
      }`
    : `I could not find any skills I recognise in that brief, so these groups are balanced on role and shared interests instead. Naming tools or skills explicitly (for example "React", "Postgres", "user research") gives me more to work with.`;

  return { skills, groups, text };
}
