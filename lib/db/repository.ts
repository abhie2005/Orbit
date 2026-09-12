/**
 * Typed data access. The ONLY module that talks to the database.
 *
 * Everything above it (API routes, the client store) works in domain types
 * from `lib/types.ts`, so swapping Neon for something else means rewriting this
 * file and nothing else — the same discipline `lib/store.ts` already follows on
 * the client.
 */

import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import * as t from "./schema";
import { buildConstellation } from "../matching";
import { deriveFeatures } from "../privacy";
import { DEMO_CLASSROOM, SEED_PULSE_BEFORE, SEED_STUDENTS } from "../seed-data";
import { pairKey } from "../matching";
import type {
  BelongingPulse,
  Classroom,
  Connection,
  Mission,
  ProfileAnswer,
  Student,
} from "../types";

export type ClassroomSnapshot = {
  classroom: Classroom;
  students: { student: Student; answers: ProfileAnswer[] }[];
  connections: Connection[];
  missions: Mission[];
  pulses: BelongingPulse[];
  suggestedPairs: string[];
};

function toClassroom(row: typeof t.classrooms.$inferSelect): Classroom {
  return {
    id: row.id,
    name: row.name,
    courseCode: row.courseCode,
    instructorName: row.instructorName,
    joinCode: row.joinCode,
    semester: row.semester,
    welcomeMessage: row.welcomeMessage ?? undefined,
    approxSize: row.approxSize ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function toStudent(row: typeof t.students.$inferSelect): Student {
  return {
    id: row.id,
    classroomId: row.classroomId,
    displayName: row.displayName,
    pronouns: row.pronouns ?? undefined,
    avatarSeed: row.avatarSeed,
    meetingPreference: row.meetingPreference,
    isSeed: row.isSeed === 1,
    isDemoUser: row.isSeed === 0,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Read the whole classroom in one round trip. */
export async function getSnapshot(classroomId = DEMO_CLASSROOM.id): Promise<ClassroomSnapshot | null> {
  const db = getDb();
  const [classroomRow] = await db
    .select()
    .from(t.classrooms)
    .where(eq(t.classrooms.id, classroomId));
  if (!classroomRow) return null;

  const [studentRows, answerRows, connectionRows, missionRows, pulseRows, pairRows] =
    await Promise.all([
      db.select().from(t.students).where(eq(t.students.classroomId, classroomId)),
      db.select().from(t.profileAnswers),
      db.select().from(t.connections).where(eq(t.connections.classroomId, classroomId)),
      db.select().from(t.missions).where(eq(t.missions.classroomId, classroomId)),
      db.select().from(t.belongingPulses).where(eq(t.belongingPulses.classroomId, classroomId)),
      db.select().from(t.suggestedPairs).where(eq(t.suggestedPairs.classroomId, classroomId)),
    ]);

  const answersByStudent = new Map<string, ProfileAnswer[]>();
  for (const row of answerRows) {
    const list = answersByStudent.get(row.studentId) ?? [];
    list.push({
      id: row.id,
      studentId: row.studentId,
      questionKey: row.questionKey,
      values: row.values,
      visibility: row.visibility,
    });
    answersByStudent.set(row.studentId, list);
  }

  return {
    classroom: toClassroom(classroomRow),
    students: studentRows.map((row) => ({
      student: toStudent(row),
      answers: answersByStudent.get(row.id) ?? [],
    })),
    connections: connectionRows.map((row) => ({
      id: row.id,
      classroomId: row.classroomId,
      studentAId: row.studentAId,
      studentBId: row.studentBId,
      score: row.score,
      reasons: row.reasons,
      status: row.status,
    })),
    missions: missionRows.map((row) => ({
      id: row.id,
      classroomId: row.classroomId,
      participantIds: row.participantIds,
      title: row.title,
      prompt: row.prompt,
      reason: row.reason,
      connectionId: row.connectionId ?? undefined,
      status: row.status,
    })),
    pulses: pulseRows.map((row) => ({
      id: row.id,
      classroomId: row.classroomId,
      phase: row.phase,
      score: row.score as 1 | 2 | 3 | 4 | 5,
      createdAt: row.createdAt.toISOString(),
    })),
    suggestedPairs: pairRows.map((row) => row.pairKey),
  };
}

/**
 * Recompute the constellation from what is stored and persist it.
 * Matching stays deterministic and server-side, so every device sees the same
 * graph rather than each recomputing its own.
 */
export async function rebuildConnections(classroomId = DEMO_CLASSROOM.id): Promise<Connection[]> {
  const db = getDb();
  const snapshot = await getSnapshot(classroomId);
  if (!snapshot) return [];

  const scorables = snapshot.students.map((r) => ({
    id: r.student.id,
    features: deriveFeatures(r.answers),
  }));
  const next = buildConstellation(classroomId, scorables, { existing: snapshot.connections });

  await db.delete(t.connections).where(eq(t.connections.classroomId, classroomId));
  if (next.length > 0) {
    await db.insert(t.connections).values(
      next.map((c) => ({
        id: c.id,
        classroomId: c.classroomId,
        studentAId: c.studentAId,
        studentBId: c.studentBId,
        score: c.score,
        reasons: c.reasons,
        status: c.status,
      })),
    );
  }
  return next;
}

export async function upsertStudent(
  student: Student,
  answers: ProfileAnswer[],
): Promise<void> {
  const db = getDb();
  await db
    .insert(t.students)
    .values({
      id: student.id,
      classroomId: student.classroomId,
      displayName: student.displayName,
      pronouns: student.pronouns ?? null,
      avatarSeed: student.avatarSeed,
      meetingPreference: student.meetingPreference,
      isSeed: student.isSeed ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: t.students.id,
      set: {
        displayName: student.displayName,
        pronouns: student.pronouns ?? null,
        meetingPreference: student.meetingPreference,
      },
    });

  await db.delete(t.profileAnswers).where(eq(t.profileAnswers.studentId, student.id));
  if (answers.length > 0) {
    await db.insert(t.profileAnswers).values(
      answers.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        questionKey: a.questionKey,
        values: a.values,
        visibility: a.visibility,
      })),
    );
  }
}

export async function setConnectionStatus(
  classroomId: string,
  aId: string,
  bId: string,
  status: Connection["status"],
): Promise<void> {
  const db = getDb();
  const key = pairKey(aId, bId);
  const rows = await db
    .select()
    .from(t.connections)
    .where(eq(t.connections.classroomId, classroomId));
  const match = rows.find((r) => pairKey(r.studentAId, r.studentBId) === key);
  if (match) {
    await db.update(t.connections).set({ status }).where(eq(t.connections.id, match.id));
  }
  await db
    .insert(t.suggestedPairs)
    .values({ classroomId, pairKey: key })
    .onConflictDoNothing();
}

export async function recordPulse(
  classroomId: string,
  phase: "before" | "after",
  score: number,
): Promise<void> {
  const db = getDb();
  await db.insert(t.belongingPulses).values({
    id: `pulse_${phase}_${crypto.randomUUID()}`,
    classroomId,
    phase,
    score,
  });
}

export async function saveMissions(missionList: Mission[]): Promise<void> {
  if (missionList.length === 0) return;
  const db = getDb();
  for (const m of missionList) {
    await db
      .insert(t.missions)
      .values({
        id: m.id,
        classroomId: m.classroomId,
        participantIds: m.participantIds,
        title: m.title,
        prompt: m.prompt,
        reason: m.reason,
        connectionId: m.connectionId ?? null,
        status: m.status,
      })
      .onConflictDoUpdate({ target: t.missions.id, set: { status: m.status } });
  }
}

/**
 * Wipe the classroom back to the seeded twenty-four. This is what the demo
 * reset button calls, so a rehearsal can be repeated exactly (spec §23.12).
 */
export async function resetToSeed(): Promise<ClassroomSnapshot> {
  const db = getDb();
  const id = DEMO_CLASSROOM.id;

  await db.delete(t.classrooms).where(eq(t.classrooms.id, id)); // cascades
  await db.insert(t.classrooms).values({
    id,
    name: DEMO_CLASSROOM.name,
    courseCode: DEMO_CLASSROOM.courseCode,
    instructorName: DEMO_CLASSROOM.instructorName,
    joinCode: DEMO_CLASSROOM.joinCode,
    semester: DEMO_CLASSROOM.semester,
    welcomeMessage: DEMO_CLASSROOM.welcomeMessage ?? null,
    approxSize: DEMO_CLASSROOM.approxSize ?? null,
  });

  await db.insert(t.students).values(
    SEED_STUDENTS.map((r) => ({
      id: r.student.id,
      classroomId: id,
      displayName: r.student.displayName,
      pronouns: r.student.pronouns ?? null,
      avatarSeed: r.student.avatarSeed,
      meetingPreference: r.student.meetingPreference,
      isSeed: 1,
    })),
  );

  const allAnswers = SEED_STUDENTS.flatMap((r) => r.answers);
  await db.insert(t.profileAnswers).values(
    allAnswers.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      questionKey: a.questionKey,
      values: a.values,
      visibility: a.visibility,
    })),
  );

  await db.insert(t.belongingPulses).values(
    SEED_PULSE_BEFORE.map((score, i) => ({
      id: `pulse_before_${i}`,
      classroomId: id,
      phase: "before" as const,
      score,
    })),
  );

  await rebuildConnections(id);

  // A few introductions already happened, so the "before" picture is honest.
  const preConfirmed: [string, string][] = [
    ["stu_maya", "stu_jordan"],
    ["stu_leo", "stu_marcus"],
    ["stu_priya", "stu_sofia"],
    ["stu_sam", "stu_noor"],
  ];
  for (const [a, b] of preConfirmed) {
    await setConnectionStatus(id, a, b, "confirmed");
  }

  return (await getSnapshot(id))!;
}

/** Ensure the demo class exists; seed it the first time. */
export async function ensureSeeded(): Promise<ClassroomSnapshot> {
  const existing = await getSnapshot();
  if (existing && existing.students.length > 0) return existing;
  return resetToSeed();
}
