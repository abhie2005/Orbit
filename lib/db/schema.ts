/**
 * Orbit's database schema (spec §14).
 *
 * Mirrors `lib/types.ts` one-to-one so the domain types stay the contract and
 * the database is an implementation detail. Nothing here changes what the
 * matching engine sees — `lib/matching.ts` still operates on StudentFeatures.
 */

import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { MatchReason, MeetingPreference, QuestionKey, Visibility } from "../types";

export const classrooms = pgTable("classrooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  courseCode: text("course_code").notNull(),
  instructorName: text("instructor_name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  semester: text("semester").notNull(),
  welcomeMessage: text("welcome_message"),
  approxSize: integer("approx_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    pronouns: text("pronouns"),
    avatarSeed: text("avatar_seed").notNull(),
    meetingPreference: text("meeting_preference")
      .$type<MeetingPreference>()
      .notNull()
      .default("either"),
    isSeed: integer("is_seed").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("students_classroom_idx").on(t.classroomId)],
);

export const profileAnswers = pgTable(
  "profile_answers",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    questionKey: text("question_key").$type<QuestionKey>().notNull(),
    values: jsonb("values").$type<string[]>().notNull(),
    visibility: text("visibility").$type<Visibility>().notNull().default("public"),
  },
  (t) => [
    index("answers_student_idx").on(t.studentId),
    uniqueIndex("answers_student_question_idx").on(t.studentId, t.questionKey),
  ],
);

export const connections = pgTable(
  "connections",
  {
    id: text("id").primaryKey(),
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    studentAId: text("student_a_id").notNull(),
    studentBId: text("student_b_id").notNull(),
    score: real("score").notNull(),
    // Reasons are derived, but stored so a client never renders an edge it
    // cannot explain, even before it recomputes.
    reasons: jsonb("reasons").$type<MatchReason[]>().notNull(),
    status: text("status")
      .$type<"suggested" | "confirmed" | "dismissed">()
      .notNull()
      .default("suggested"),
  },
  (t) => [index("connections_classroom_idx").on(t.classroomId)],
);

export const missions = pgTable(
  "missions",
  {
    id: text("id").primaryKey(),
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    participantIds: jsonb("participant_ids").$type<string[]>().notNull(),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    reason: text("reason").notNull(),
    connectionId: text("connection_id"),
    status: text("status")
      .$type<"active" | "completed" | "skipped">()
      .notNull()
      .default("active"),
  },
  (t) => [index("missions_classroom_idx").on(t.classroomId)],
);

/**
 * Belonging pulse responses are deliberately NOT linked to a student id.
 * Spec §10 promises anonymity, and the cheapest way to keep that promise is to
 * make it impossible to break: there is no column to join on.
 */
export const belongingPulses = pgTable(
  "belonging_pulses",
  {
    id: text("id").primaryKey(),
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    phase: text("phase").$type<"before" | "after">().notNull(),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pulses_classroom_idx").on(t.classroomId)],
);

/** Pairs already suggested, so the engine stops repeating itself. */
export const suggestedPairs = pgTable(
  "suggested_pairs",
  {
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    pairKey: text("pair_key").notNull(),
  },
  (t) => [primaryKey({ columns: [t.classroomId, t.pairKey] })],
);
