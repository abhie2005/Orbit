/**
 * Orbit domain types.
 *
 * Pure types only — this module must stay importable from Node with no React
 * or browser dependencies (see AGENTS.md rule 5).
 */

export type ProjectRole =
  | "builder"
  | "researcher"
  | "designer"
  | "organizer"
  | "writer"
  | "presenter";

export type MeetingPreference = "one_on_one" | "small_group" | "either";

export type Visibility = "public" | "match_only" | "private";

export type MatchCategory =
  | "academic"
  | "social"
  | "complementary_skill"
  | "language";

/** Spec §14 */
export type Classroom = {
  id: string;
  name: string;
  courseCode: string;
  instructorName: string;
  joinCode: string;
  semester: string;
  welcomeMessage?: string;
  approxSize?: number;
  createdAt: string;
};

export type Student = {
  id: string;
  classroomId: string;
  displayName: string;
  pronouns?: string;
  avatarSeed: string;
  meetingPreference: MeetingPreference;
  /** Marks the locally-joined demo student so the UI can centre on them. */
  isDemoUser?: boolean;
  /** Seeded fictional students, used to label demo data honestly. */
  isSeed?: boolean;
  createdAt: string;
};

export type ProfileAnswer = {
  id: string;
  studentId: string;
  questionKey: QuestionKey;
  values: string[];
  visibility: Visibility;
};

/** Spec §8.3 — every edge is built from explicit reasons, never inference. */
export type MatchReason = {
  category: MatchCategory;
  label: string;
  weight: number;
  /**
   * Only set for `complementary_skill`: who offers the skill and who wants it.
   * Lets the UI say "Maya wants to learn X, a skill you can help with".
   */
  direction?: { providerId: string; learnerId: string };
};

export type ConnectionStatus = "suggested" | "confirmed" | "dismissed";

export type Connection = {
  id: string;
  classroomId: string;
  studentAId: string;
  studentBId: string;
  score: number;
  reasons: MatchReason[];
  status: ConnectionStatus;
};

export type MissionStatus = "active" | "completed" | "skipped";

export type Mission = {
  id: string;
  classroomId: string;
  /** The student the mission belongs to, first; then the suggested partner(s). */
  participantIds: string[];
  title: string;
  prompt: string;
  reason: string;
  connectionId?: string;
  status: MissionStatus;
};

export type BelongingPulse = {
  id: string;
  classroomId: string;
  phase: "before" | "after";
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
};

/** Spec §8.1 — normalised, controlled-vocabulary features used for matching. */
export type StudentFeatures = {
  academicInterests: string[];
  movieGenres: string[];
  sports: string[];
  hobbies: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  projectRoles: ProjectRole[];
  languages: string[];
  meetingPreference: MeetingPreference;
};

export type QuestionKey =
  | "home"
  | "academicInterests"
  | "movieGenres"
  | "sports"
  | "hobbies"
  | "skillsOffered"
  | "skillsWanted"
  | "projectRoles"
  | "languages"
  | "meetingPreference"
  | "conversationStarter";

export type QuestionType = "chips" | "single" | "text";

export type Question = {
  key: QuestionKey;
  /** Step heading shown during onboarding. */
  prompt: string;
  helper: string;
  type: QuestionType;
  options?: readonly string[];
  /** Free text answers are displayed but never used for matching (spec §8.1). */
  usedForMatching: boolean;
  /** Only the display name is mandatory (spec §4.2). */
  optional: boolean;
  maxSelections?: number;
  placeholder?: string;
  /** Part of the six-question core path used in the 3-minute demo. */
  core: boolean;
};

/** A passport is a view over a student + their public answers. */
export type Passport = {
  student: Student;
  home?: string;
  conversationStarter?: string;
  features: StudentFeatures;
  /** Deterministic visual seed values derived from the student id. */
  orbit: {
    rings: number;
    tilt: number;
    hue: number;
    stampRotations: number[];
  };
};

export type EdgeCategoryMeta = {
  category: MatchCategory;
  label: string;
  colorVar: string;
  /** Never rely on colour alone (spec §20) — every category has a pattern too. */
  dashArray: string;
  description: string;
};
