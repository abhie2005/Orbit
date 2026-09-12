"use client";

/**
 * The one and only persistence boundary (AGENTS.md rule 4).
 *
 * Everything lives in localStorage. That is a deliberate hackathon choice: the
 * demo must never fail on stage because of a network call. Components talk to
 * this module, never to `localStorage`, so a Supabase adapter can replace the
 * read/write pair below without touching a single component.
 */

import { useCallback, useSyncExternalStore } from "react";
import { buildConstellation, confirmedDegrees, pairKey } from "./matching";
import { deriveFeatures } from "./privacy";
import {
  DEMO_CLASSROOM,
  SEED_PULSE_BEFORE,
  SEED_STUDENTS,
  type StudentRecord,
} from "./seed-data";
import type {
  BelongingPulse,
  Classroom,
  Connection,
  Mission,
  ProfileAnswer,
  QuestionKey,
  Student,
  StudentFeatures,
} from "./types";

const STORAGE_KEY = "orbit.state.v1";
const STATE_VERSION = 1;

export type OrbitState = {
  version: number;
  classroom: Classroom;
  students: StudentRecord[];
  connections: Connection[];
  missions: Mission[];
  pulses: BelongingPulse[];
  /** The locally-joined student. Null until someone completes onboarding. */
  currentStudentId: string | null;
  /** Pairs already suggested, so we stop repeating ourselves. */
  suggestedPairs: string[];
};

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

function scorables(students: readonly StudentRecord[]): {
  id: string;
  features: StudentFeatures;
}[] {
  return students.map((r) => ({ id: r.student.id, features: deriveFeatures(r.answers) }));
}

export function rebuildConnections(state: OrbitState): Connection[] {
  return buildConstellation(state.classroom.id, scorables(state.students), {
    existing: state.connections,
  });
}

export function createSeededState(): OrbitState {
  const base: OrbitState = {
    version: STATE_VERSION,
    classroom: DEMO_CLASSROOM,
    students: SEED_STUDENTS,
    connections: [],
    missions: [],
    pulses: SEED_PULSE_BEFORE.map((score, i) => ({
      id: `pulse_before_${i}`,
      classroomId: DEMO_CLASSROOM.id,
      phase: "before" as const,
      score,
      createdAt: DEMO_CLASSROOM.createdAt,
    })),
    currentStudentId: null,
    suggestedPairs: [],
  };
  base.connections = rebuildConnections(base);

  // A handful of introductions already happened before our demo student joins,
  // so the "before" picture is honest rather than an empty graph.
  const preConfirmed = new Set([
    pairKey("stu_maya", "stu_jordan"),
    pairKey("stu_leo", "stu_marcus"),
    pairKey("stu_priya", "stu_sofia"),
    pairKey("stu_sam", "stu_noor"),
  ]);
  base.connections = base.connections.map((c) =>
    preConfirmed.has(pairKey(c.studentAId, c.studentBId))
      ? { ...c, status: "confirmed" as const }
      : c,
  );
  return base;
}

// ---------------------------------------------------------------------------
// Store plumbing (useSyncExternalStore)
// ---------------------------------------------------------------------------

let memoryState: OrbitState | null = null;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): OrbitState {
  if (memoryState) return memoryState;
  if (!isBrowser()) {
    memoryState = createSeededState();
    return memoryState;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OrbitState;
      if (parsed?.version === STATE_VERSION && Array.isArray(parsed.students)) {
        memoryState = parsed;
        return memoryState;
      }
    }
  } catch {
    // Corrupt or unavailable storage must never break the demo.
  }
  memoryState = createSeededState();
  write(memoryState);
  return memoryState;
}

function write(next: OrbitState): void {
  memoryState = next;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private-mode storage failures are survivable; state stays in memory.
    }
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server render always sees the pristine seeded class. */
let serverSnapshot: OrbitState | null = null;
function getServerSnapshot(): OrbitState {
  serverSnapshot ??= createSeededState();
  return serverSnapshot;
}

export function update(mutate: (state: OrbitState) => OrbitState): OrbitState {
  const next = mutate(read());
  write(next);
  return next;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function resetDemo(): void {
  memoryState = null;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  write(createSeededState());
}

export function joinCodeMatches(code: string, classroom: Classroom): boolean {
  return code.trim().toUpperCase() === classroom.joinCode.toUpperCase();
}

export type DraftProfile = {
  displayName: string;
  pronouns?: string;
  answers: Partial<Record<QuestionKey, string[]>>;
};

/** Create (or replace) the locally-joined student and rebuild the graph. */
export function upsertCurrentStudent(draft: DraftProfile): string {
  const id = read().currentStudentId ?? `stu_me_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const meetingPreference =
    (draft.answers.meetingPreference?.[0] as Student["meetingPreference"]) ?? "either";

  const student: Student = {
    id,
    classroomId: read().classroom.id,
    displayName: draft.displayName.trim() || "New student",
    pronouns: draft.pronouns?.trim() || undefined,
    avatarSeed: id,
    meetingPreference,
    isDemoUser: true,
    createdAt: now,
  };

  const answers: ProfileAnswer[] = Object.entries(draft.answers)
    .filter(([, values]) => values && values.length > 0)
    .map(([key, values]) => ({
      id: `ans_${id}_${key}`,
      studentId: id,
      questionKey: key as QuestionKey,
      values: values as string[],
      visibility: "public" as const,
    }));

  update((state) => {
    const others = state.students.filter((r) => r.student.id !== id);
    const next: OrbitState = {
      ...state,
      students: [...others, { student, answers }],
      currentStudentId: id,
    };
    next.connections = rebuildConnections(next);
    return next;
  });

  return id;
}

export type NewClassroom = {
  name: string;
  courseCode: string;
  instructorName: string;
  semester: string;
  approxSize?: number;
  welcomeMessage?: string;
};

/** Six characters, no ambiguous 0/O/1/I, derived from the class details. */
export function generateJoinCode(seed: string): string {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    hash = Math.imul(hash, 1664525) + 1013904223;
    code += ALPHABET[(hash >>> 8) % ALPHABET.length];
  }
  return code;
}

/**
 * Start a real, empty class. This REPLACES the seeded demo class — the empty
 * constellation state is the honest result, and "Reset demo" brings the twelve
 * fictional students back.
 */
export function createClassroom(input: NewClassroom): Classroom {
  const now = new Date().toISOString();
  const classroom: Classroom = {
    id: `class_${now}`,
    name: input.name.trim() || "Untitled class",
    courseCode: input.courseCode.trim() || "CLASS",
    instructorName: input.instructorName.trim() || "Instructor",
    semester: input.semester.trim() || "This semester",
    joinCode: generateJoinCode(`${input.name}|${input.courseCode}|${now}`),
    welcomeMessage: input.welcomeMessage?.trim() || undefined,
    approxSize: input.approxSize,
    createdAt: now,
  };

  update(() => ({
    version: STATE_VERSION,
    classroom,
    students: [],
    connections: [],
    missions: [],
    pulses: [],
    currentStudentId: null,
    suggestedPairs: [],
  }));

  return classroom;
}

export function setConnectionStatus(
  connectionId: string,
  status: Connection["status"],
): void {
  update((state) => ({
    ...state,
    connections: state.connections.map((c) =>
      c.id === connectionId ? { ...c, status } : c,
    ),
  }));
}

/** Confirm a real introduction between two students (dashed edge → solid). */
export function confirmIntroduction(aId: string, bId: string): void {
  update((state) => {
    const key = pairKey(aId, bId);
    const exists = state.connections.some(
      (c) => pairKey(c.studentAId, c.studentBId) === key,
    );
    const connections = exists
      ? state.connections.map((c) =>
          pairKey(c.studentAId, c.studentBId) === key
            ? { ...c, status: "confirmed" as const }
            : c,
        )
      : state.connections;
    return {
      ...state,
      connections,
      missions: state.missions.map((m) =>
        m.participantIds.includes(aId) && m.participantIds.includes(bId)
          ? { ...m, status: "completed" as const }
          : m,
      ),
      suggestedPairs: [...new Set([...state.suggestedPairs, key])],
    };
  });
}

export function dismissSuggestion(aId: string, bId: string): void {
  update((state) => {
    const key = pairKey(aId, bId);
    return {
      ...state,
      connections: state.connections.map((c) =>
        pairKey(c.studentAId, c.studentBId) === key
          ? { ...c, status: "dismissed" as const }
          : c,
      ),
      suggestedPairs: [...new Set([...state.suggestedPairs, key])],
    };
  });
}

export function recordPulse(phase: "before" | "after", score: 1 | 2 | 3 | 4 | 5): void {
  update((state) => ({
    ...state,
    pulses: [
      ...state.pulses,
      {
        id: `pulse_${phase}_${state.pulses.length}`,
        classroomId: state.classroom.id,
        phase,
        score,
        createdAt: new Date().toISOString(),
      },
    ],
  }));
}

export function saveMissions(missions: Mission[]): void {
  update((state) => {
    const byId = new Map(state.missions.map((m) => [m.id, m]));
    for (const mission of missions) byId.set(mission.id, mission);
    return { ...state, missions: [...byId.values()] };
  });
}

export function setMissionStatus(missionId: string, status: Mission["status"]): void {
  update((state) => ({
    ...state,
    missions: state.missions.map((m) => (m.id === missionId ? { ...m, status } : m)),
  }));
}

/** Simulate the rest of the class meeting each other, for the "after" story. */
export function simulateClassActivity(): void {
  update((state) => {
    const connections = state.connections.map((c, index) =>
      c.status === "suggested" && index % 2 === 0
        ? { ...c, status: "confirmed" as const }
        : c,
    );
    const after: BelongingPulse[] = [4, 5, 4, 4, 3, 5, 4, 5, 4, 4, 5, 3].map(
      (score, i) => ({
        id: `pulse_after_${i}`,
        classroomId: state.classroom.id,
        phase: "after" as const,
        score: score as 1 | 2 | 3 | 4 | 5,
        createdAt: new Date().toISOString(),
      }),
    );
    const withoutOldAfter = state.pulses.filter((p) => p.phase !== "after");
    return { ...state, connections, pulses: [...withoutOldAfter, ...after] };
  });
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useOrbit(): OrbitState {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

export function useCurrentStudent(): StudentRecord | null {
  const state = useOrbit();
  if (!state.currentStudentId) return null;
  return state.students.find((r) => r.student.id === state.currentStudentId) ?? null;
}

/** Derived view used by the constellation and dashboard. */
export function useClassView() {
  const state = useOrbit();
  const features = scorables(state.students);
  const names = Object.fromEntries(
    state.students.map((r) => [r.student.id, r.student.displayName]),
  );
  const degrees = confirmedDegrees(
    state.students.map((r) => r.student.id),
    state.connections,
  );
  const reset = useCallback(() => resetDemo(), []);
  return { ...state, features, names, degrees, reset };
}
