"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { confirmedDegrees } from "@/lib/matching";
import { missionQueueFor } from "@/lib/missions";
import { deriveFeatures } from "@/lib/privacy";
import { confirmIntroduction, useOrbit } from "@/lib/store";

/**
 * One mission at a time (spec §7.7). Low pressure by design: skipping is free
 * and never recorded against the student or the classmate.
 */
export function MissionPanel({ onFocusStudent }: { onFocusStudent?: (id: string) => void }) {
  const state = useOrbit();
  const reduceMotion = useReducedMotion();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const currentId = state.currentStudentId;

  const { missions, names } = useMemo(() => {
    const nameMap = Object.fromEntries(
      state.students.map((r) => [r.student.id, r.student.displayName]),
    );
    if (!currentId) return { missions: [], names: nameMap };

    const scorables = state.students.map((r) => ({
      id: r.student.id,
      features: deriveFeatures(r.answers),
      displayName: r.student.displayName,
    }));

    // Anyone already met, or skipped this session, drops out of the queue.
    const met = new Set<string>();
    for (const c of state.connections) {
      if (c.status !== "confirmed") continue;
      if (c.studentAId === currentId) met.add(c.studentBId);
      if (c.studentBId === currentId) met.add(c.studentAId);
    }
    const exclude = new Set([...met, ...skipped]);

    return {
      missions: missionQueueFor(
        {
          classroomId: state.classroom.id,
          studentId: currentId,
          students: scorables,
          excludeIds: exclude,
          ctx: {
            confirmedDegree: confirmedDegrees(
              state.students.map((r) => r.student.id),
              state.connections,
            ),
          },
        },
        3,
      ),
      names: nameMap,
    };
  }, [state.students, state.connections, state.classroom.id, currentId, skipped]);

  if (!currentId) {
    return (
      <Card className="p-6">
        <SectionLabel>Connection mission</SectionLabel>
        <p className="mt-3 text-sm text-muted">
          Join the class to get a mission of your own.
        </p>
      </Card>
    );
  }

  const mission = missions[0];
  const partnerId = mission?.participantIds[1];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Connection mission</SectionLabel>
        {justCompleted ? (
          <span className="rounded-full border border-green/50 bg-green/10 px-2.5 py-0.5 text-[0.65rem] text-green">
            Introduction recorded
          </span>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mission ? (
          <motion.div
            key={mission.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="mt-3 text-xl font-semibold tracking-tight">{mission.title}</h2>

            <p className="mt-3 rounded-2xl border border-line bg-bg/40 p-4 text-sm leading-relaxed text-ink">
              {mission.prompt}
            </p>

            <div className="mt-4 border-l-2 border-violet/60 pl-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Why them</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{mission.reason}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button
                className="px-5 py-2.5 text-sm"
                onClick={() => {
                  if (!partnerId) return;
                  confirmIntroduction(currentId, partnerId);
                  setJustCompleted(partnerId);
                  onFocusStudent?.(partnerId);
                }}
              >
                We met
              </Button>
              <Button
                variant="secondary"
                className="px-5 py-2.5 text-sm"
                onClick={() => partnerId && setSkipped((prev) => [...prev, partnerId])}
              >
                Suggest someone else
              </Button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Skipping costs nothing and is never shown to anyone — not to{" "}
              {partnerId ? names[partnerId] : "them"}, not to your professor.
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            No more suggestions right now. That is a good sign — it means Orbit has
            run out of people it can honestly explain a reason for.
          </motion.p>
        )}
      </AnimatePresence>
    </Card>
  );
}
