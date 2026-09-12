"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PassportCard } from "@/components/passport/passport-card";
import { Button, ButtonLink, Card, SectionLabel } from "@/components/ui/primitives";
import { explainReasons, rankSuggestionsFor } from "@/lib/matching";
import { buildPassport } from "@/lib/passport";
import { confirmedDegrees } from "@/lib/matching";
import { deriveFeatures } from "@/lib/privacy";
import { useOrbit } from "@/lib/store";

export function PassportReveal() {
  const router = useRouter();
  const state = useOrbit();
  const reduceMotion = useReducedMotion();

  const record = state.students.find((r) => r.student.id === state.currentStudentId);

  useEffect(() => {
    if (!record) router.replace("/join");
  }, [record, router]);

  const suggestions = useMemo(() => {
    if (!record) return [];
    const scorables = state.students.map((r) => ({
      id: r.student.id,
      features: deriveFeatures(r.answers),
    }));
    const names = Object.fromEntries(
      state.students.map((r) => [r.student.id, r.student.displayName]),
    );
    const degrees = confirmedDegrees(
      state.students.map((r) => r.student.id),
      state.connections,
    );
    return rankSuggestionsFor(record.student.id, scorables, {
      confirmedDegree: degrees,
    })
      .slice(0, 3)
      .map((entry) => ({
        name: names[entry.studentId] ?? "Classmate",
        lines: explainReasons(entry.reasons, names, record.student.id, 2),
      }));
  }, [record, state.students, state.connections]);

  if (!record) return null;

  const passport = buildPassport(record.student, record.answers);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionLabel>Your passport is ready</SectionLabel>
        <h1 className="mt-3 mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to the class, {record.student.displayName}.
        </h1>
        <PassportCard passport={passport} classroom={state.classroom} reveal />
      </motion.div>

      <motion.aside
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.5 }}
        className="space-y-4"
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold">People worth meeting</h2>
          <p className="mt-1.5 text-sm text-muted">
            Every suggestion below comes from something you both actually chose.
          </p>

          <ul className="mt-5 space-y-4">
            {suggestions.map((suggestion) => (
              <li key={suggestion.name} className="border-l-2 border-violet/50 pl-3.5">
                <p className="font-medium text-ink">{suggestion.name}</p>
                <ul className="mt-1 space-y-1">
                  {suggestion.lines.map((line) => (
                    <li key={line} className="text-sm leading-relaxed text-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <ButtonLink href="/constellation" className="mt-6 w-full">
            Enter the constellation
          </ButtonLink>
        </Card>

        <Card className="p-5">
          <p className="text-xs leading-relaxed text-muted">
            Nobody in this class can see how many connections you have. Orbit does
            not rank students and never will.
          </p>
          <Button
            variant="ghost"
            className="mt-3 px-0 py-1 text-sm"
            onClick={() => router.push("/onboarding")}
          >
            Edit my answers
          </Button>
        </Card>
      </motion.aside>
    </div>
  );
}
