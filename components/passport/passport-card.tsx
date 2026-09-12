"use client";

import { motion, useReducedMotion } from "framer-motion";
import { OrbitAvatar } from "@/components/passport/orbit-avatar";
import { serialFor } from "@/lib/passport";
import { MEETING_PREFERENCE_LABELS, PROJECT_ROLE_LABELS } from "@/lib/questions";
import type { Classroom, Passport } from "@/lib/types";

/**
 * The passport (spec §7.5). A designed artefact, not a profile card: stamps,
 * a serial number, and an issuing class. Nationality is deliberately never the
 * dominant visual — "home" is one small line of text, no flags.
 */
export function PassportCard({
  passport,
  classroom,
  reveal = false,
}: {
  passport: Passport;
  classroom: Classroom;
  reveal?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { student, features, orbit } = passport;

  const stamps = [
    ...features.academicInterests.slice(0, 3),
    ...features.hobbies.slice(0, 2),
    ...features.movieGenres.slice(0, 1),
    ...features.sports.slice(0, 1),
  ].slice(0, 6);

  const stampDelay = (i: number) => (reveal && !reduceMotion ? 0.45 + i * 0.09 : 0);

  return (
    <article className="relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-surface-2 via-surface to-surface-2 shadow-2xl shadow-black/40">
      {/* Passport header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-line/80 bg-bg/50 px-6 py-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-muted">
          Orbit Passport
        </p>
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-muted">
          {classroom.courseCode} · {classroom.semester}
        </p>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-5">
          <motion.div
            initial={reveal && !reduceMotion ? { scale: 0.7, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <OrbitAvatar passport={passport} size={116} />
          </motion.div>

          <div className="min-w-0 flex-1 pt-1">
            <h2 className="truncate text-2xl font-semibold tracking-tight">
              {student.displayName}
            </h2>
            {student.pronouns ? (
              <p className="mt-0.5 text-sm text-muted">{student.pronouns}</p>
            ) : null}
            {passport.home ? (
              <p className="mt-2 text-sm text-muted">
                <span className="text-muted/70">Home · </span>
                {passport.home}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {features.projectRoles[0] ? (
                <span className="rounded-full border border-blue/40 bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
                  {PROJECT_ROLE_LABELS[features.projectRoles[0]]}
                </span>
              ) : null}
              <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted">
                {MEETING_PREFERENCE_LABELS[features.meetingPreference]}
              </span>
            </div>
          </div>
        </div>

        {/* Stamps */}
        {stamps.length > 0 ? (
          <section className="mt-7">
            <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted">
              Stamps
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {stamps.map((stamp, i) => (
                <motion.span
                  key={stamp}
                  initial={reveal && !reduceMotion ? { scale: 1.5, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: stampDelay(i),
                    duration: 0.32,
                    ease: [0.34, 1.4, 0.64, 1],
                  }}
                  style={{ rotate: `${orbit.stampRotations[i % 3]}deg` }}
                  className="rounded-lg border-2 border-dashed border-amber/50 bg-amber/10 px-3 py-1.5 text-sm font-medium text-amber"
                >
                  {stamp}
                </motion.span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Skill exchange */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <SkillPanel
            title="Can help with"
            tone="green"
            items={features.skillsOffered}
            empty="Nothing listed yet."
          />
          <SkillPanel
            title="Wants to learn"
            tone="violet"
            items={features.skillsWanted}
            empty="Nothing listed yet."
          />
        </div>

        {passport.conversationStarter ? (
          <section className="mt-6 rounded-2xl border border-line bg-bg/40 p-4">
            <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted">
              Ask me about
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              “{passport.conversationStarter}”
            </p>
          </section>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line/80 bg-bg/50 px-6 py-3">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted">
          {serialFor(student, classroom.courseCode)}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
          {classroom.name}
        </p>
      </div>
    </article>
  );
}

function SkillPanel({
  title,
  items,
  tone,
  empty,
}: {
  title: string;
  items: string[];
  tone: "green" | "violet";
  empty: string;
}) {
  const ring =
    tone === "green"
      ? "border-green/35 bg-green/10 text-green"
      : "border-violet/35 bg-violet/10 text-violet";
  return (
    <section>
      <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2.5 text-sm text-muted/70">{empty}</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className={`rounded-full border px-3 py-1 text-sm ${ring}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
