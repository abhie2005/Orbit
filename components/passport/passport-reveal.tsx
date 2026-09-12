"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PassportCard } from "@/components/passport/passport-card";
import { Button, ButtonLink, Card, SectionLabel } from "@/components/ui/primitives";
import { explainReasons, rankSuggestionsFor } from "@/lib/matching";
import { buildPassport, serialFor } from "@/lib/passport";
import { confirmedDegrees } from "@/lib/matching";
import { deriveFeatures } from "@/lib/privacy";
import { useOrbit } from "@/lib/store";

function htmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function downloadPassportHtml(passport: ReturnType<typeof buildPassport>, classroom: { courseCode: string }) {
  const student = passport.student;
  const serial = serialFor(student, classroom.courseCode);
  const publicFeatures = [
    ["Can help with", passport.features.academicInterests, passport.features.projectRoles]
      .flat()
      .slice(0, 4),
  ];
  const answers = [
    ["Home", passport.home ?? "—"],
    ["Pronouns", student.pronouns ?? "—"],
    ["Can help with", passport.features.academicInterests.join(", ") || "—"],
    ["Would like to learn", passport.features.projectRoles.join(", ") || "—"],
    ["Movies", passport.features.movieGenres.join(", ") || "—"],
  ];

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${htmlEscape(student.displayName)} Orbit Passport</title>
<style>
:root { --paper: #fbf9f4; --ink: #15161a; --muted: #676c72; --rule: #b5a88d; --wine: #6d2a3b; --blue: #1d4ed8; --green: #146c34; --paper-blue: #c7d3e8; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, Helvetica, sans-serif; color: var(--ink); background: repeating-linear-gradient(45deg, var(--paper), var(--paper) 12px, #f6f3ea 12px, #f6f3ea 24px); }
.passport { width: min(760px, calc(100vw - 40px)); background: var(--paper); border: 2px solid var(--ink); padding: 22px; box-shadow: 0 12px 0 var(--rule); }
.kicker { font-family: "Courier New", Courier, monospace; font-size: 12px; letter-spacing: 0.2em; border-bottom: 2px solid var(--ink); padding-bottom: 7px; }
.title { margin: 16px 0 8px; font-family: Georgia, "Times New Roman", serif; font-size: clamp(46px, 7vw, 64px); font-weight: 700; letter-spacing: -0.02em; }
.meta { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 16px; border-top: 2px solid var(--rule); padding-top: 16px; }
.label { color: var(--muted); font-family: "Courier New", Courier, monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; }
.value { margin-top: 4px; font-size: 16px; font-weight: 700; }
.serial { font-family: "Courier New", Courier, monospace; color: var(--wine); }
.stamp { display: inline-block; border: 2px dashed var(--wine); color: var(--wine); padding: 9px 14px; font-weight: 700; transform: rotate(-7deg); }
</style>
</head>
<body>
<article class="passport">
  <div class="kicker">ORBIT / PASSPORT</div>
  <div class="title">${htmlEscape(student.displayName)}</div>
  <div class="serial">${htmlEscape(serial)}</div>
  <div class="stamp">UNIQUE PASSPORT</div>
  <section class="meta">
    ${answers
      .map(
        ([label, value]) => `
      <div>
        <div class="label">${htmlEscape(label)}</div>
        <div class="value">${htmlEscape(value)}</div>
      </div>
    `,
      )
      .join("")}
  </section>
</article>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `orbit-passport-${htmlEscape(student.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

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
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionLabel>Your passport is ready</SectionLabel>
        <h1 className="mt-3 mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to the class, {record.student.displayName}.
        </h1>
        {/* Capped width so it reads as a collectible card, not a wide banner. */}
        <div className="max-w-[34rem]">
          <PassportCard passport={passport} classroom={state.classroom} reveal />
        </div>
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
              <li key={suggestion.name} className="border-l-2 border-wine/50 pl-3.5">
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
          <Button
            variant="secondary"
            className="mt-3 w-full text-sm"
            onClick={() => downloadPassportHtml(passport, state.classroom)}
          >
            Download my unique passport
          </Button>
        </Card>
      </motion.aside>
    </div>
  );
}
