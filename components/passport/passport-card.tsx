"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { OrbitAvatar } from "@/components/passport/orbit-avatar";
import { serialFor } from "@/lib/passport";
import { MEETING_PREFERENCE_LABELS, PROJECT_ROLE_LABELS } from "@/lib/questions";
import type { Classroom, Passport } from "@/lib/types";

/**
 * The passport (spec §7.5) — a designed artefact, not a profile card.
 *
 * Modelled on a printed ID card: paper stock, a dashed cut line, boxed form
 * fields with typewriter labels, a rubber stamp, a barcode and a serial. It is
 * the single light surface in Orbit because it is a physical thing the student
 * receives, held against the night sky.
 *
 * Nationality is deliberately never the dominant visual (spec §7.5): "home" is
 * one small optional field and there are no flags anywhere.
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
  const [face, setFace] = useState<"front" | "back">("front");
  const titleId = useId();
  const { student, features } = passport;
  const serial = serialFor(student, classroom.courseCode);

  return (
    <div className="w-full">
      <div className="[perspective:1800px]">
        <div
          className="passport-flip relative"
          data-face={face}
          style={{ transitionDuration: reduceMotion ? "0ms" : undefined }}
        >
          <div className="passport-face">
            <PassportFront
              passport={passport}
              classroom={classroom}
              serial={serial}
              reveal={reveal}
              reduceMotion={Boolean(reduceMotion)}
              titleId={titleId}
            />
          </div>

          {/* The back is absolutely stacked so the card keeps one footprint. */}
          <div
            className="passport-face passport-face-back absolute inset-0"
            aria-hidden={face === "front"}
          >
            <PassportBack passport={passport} classroom={classroom} serial={serial} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setFace(face === "front" ? "back" : "front")}
          className="rounded-none border-2 border-ink bg-surface-2 px-4 py-2 text-sm text-muted transition-colors hover:border-blue/60 hover:text-ink"
        >
          {face === "front" ? "Turn the card over →" : "← Back to the front"}
        </button>
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-muted">{serial}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PassportFront({
  passport,
  classroom,
  serial,
  reveal,
  reduceMotion,
  titleId,
}: {
  passport: Passport;
  classroom: Classroom;
  serial: string;
  reveal: boolean;
  reduceMotion: boolean;
  titleId: string;
}) {
  const { student, features, orbit } = passport;

  // Two only, and hung off the frame's bottom edge — three stacked upward far
  // enough to cover the initials.
  const stickers = [
    ...features.academicInterests.slice(0, 1),
    ...features.hobbies.slice(0, 1),
    ...features.movieGenres.slice(0, 1),
  ].slice(0, 2);

  const role = features.projectRoles[0];

  return (
    <article
      aria-labelledby={titleId}
      className="passport relative overflow-hidden rounded-none p-3 brut-shadow sm:p-4"
    >
      <span className="passport-cut" aria-hidden="true" />

      <div className="relative p-3 sm:p-4">
        {/* Star rail, as on the reference card */}
        <div className="mb-3 flex items-center justify-between px-1" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Star key={i} />
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Photo panel */}
          <div className="shrink-0">
            <div className="relative w-[8.5rem] border border-[color:var(--paper-rule)] bg-white p-1.5">
              <div className="flex aspect-[3/3.2] items-center justify-center bg-[color:var(--paper-shade)]">
                <OrbitAvatar passport={passport} size={132} animate={false} />
              </div>

              {/* Stickers slapped over the photo corner */}
              <div className="absolute -bottom-3 left-0 right-0 flex translate-y-1/3 flex-col items-start gap-1">
                {stickers.map((sticker, i) => (
                  <motion.span
                    key={sticker}
                    initial={reveal && !reduceMotion ? { scale: 1.5, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.3 }}
                    style={{
                      rotate: `${orbit.stampRotations[i % 3]}deg`,
                      background: [
                        "var(--paper-blue)",
                        "#f2c14e",
                        "#7ec4a7",
                      ][i % 3],
                      color: i === 0 ? "#fff" : "var(--paper-ink)",
                    }}
                    className="passport-sticker max-w-full truncate"
                  >
                    {sticker}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="mt-5 w-[8.5rem]">
              <div className="passport-barcode h-9 w-full" aria-hidden="true" />
              <p className="mt-1 text-center font-mono text-[0.55rem] tracking-[0.1em]">
                {serial}
              </p>
            </div>
          </div>

          {/* Details panel */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-[2.1rem] leading-[0.85] tracking-tight sm:text-[2.6rem]"
                >
                  ORBIT
                </h2>
                <p className="font-[family-name:var(--font-display)] text-[1.15rem] leading-none tracking-tight sm:text-[1.4rem]">
                  PASSPORT
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="passport-label">Passport no.</p>
                <p className="font-mono text-sm font-bold tracking-[0.18em] text-[color:var(--paper-red)]">
                  {serial.split("-")[1] ?? "000000"}
                </p>
              </div>
            </div>

            <p className="mt-2 max-w-[20rem] font-mono text-[0.52rem] leading-[1.5] text-[color:var(--paper-faint)]">
              This passport is issued on the holder&apos;s own answers. It records what
              they chose to share, nothing inferred, and it carries no score, rank or
              count of any kind.
            </p>

            <div className="mt-3 grid gap-1.5">
              <div className="grid grid-cols-[1fr_auto] gap-1.5">
                <div className="passport-field">
                  <p className="passport-label">Display name</p>
                  <p className="passport-value text-base">{student.displayName}</p>
                </div>
                <div className="passport-field flex w-[7.5rem] flex-col justify-between">
                  <p className="passport-label">Signature</p>
                  <p className="truncate font-[family-name:var(--font-hand)] text-lg leading-none text-[color:var(--paper-blue)]">
                    {student.displayName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="passport-field">
                  <p className="passport-label">Pronouns</p>
                  <p className="passport-value">{student.pronouns || "—"}</p>
                </div>
                <div className="passport-field">
                  <p className="passport-label">Home</p>
                  <p className="passport-value">{passport.home || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="passport-field">
                  <p className="passport-label">Issued by</p>
                  <p className="passport-value">{classroom.courseCode}</p>
                </div>
                <div className="passport-field">
                  <p className="passport-label">Meets as</p>
                  <p className="passport-value">
                    {MEETING_PREFERENCE_LABELS[features.meetingPreference]}
                  </p>
                </div>
              </div>
            </div>

            {/* The headline field, like "GRAPHIC USER" on the reference */}
            <p className="mt-3 font-[family-name:var(--font-display)] text-[1.6rem] leading-none tracking-tight sm:text-[2rem]">
              {role ? PROJECT_ROLE_LABELS[role].toUpperCase() : "CLASSMATE"}
            </p>

            <div className="passport-field mt-2">
              <p className="passport-label">Can help with</p>
              <p className="passport-value">
                {features.skillsOffered.length > 0
                  ? features.skillsOffered.join(" · ")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Rubber stamp */}
        <motion.div
          initial={reveal && !reduceMotion ? { scale: 2.2, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 0.34 }}
          transition={{ delay: 0.75, duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
          className="passport-stamp pointer-events-none absolute bottom-5 left-6 z-10 flex h-[4.6rem] w-[4.6rem] items-center justify-center text-center text-[0.46rem] font-bold leading-tight sm:h-20 sm:w-20 sm:text-[0.52rem]"
          aria-hidden="true"
        >
          ISSUED
          <br />
          {classroom.semester.toUpperCase()}
        </motion.div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

function PassportBack({
  passport,
  classroom,
  serial,
}: {
  passport: Passport;
  classroom: Classroom;
  serial: string;
}) {
  const { features } = passport;

  return (
    <article className="passport relative h-full overflow-hidden rounded-none p-3 brut-shadow sm:p-4">
      <span className="passport-cut" aria-hidden="true" />

      <div className="relative flex h-full flex-col p-3 sm:p-4">
        <div className="flex flex-1 gap-4">
          {/* Sticker cluster, mirroring the reference's back panel */}
          <div className="hidden w-[8.5rem] shrink-0 flex-col items-start gap-2 pt-6 sm:flex">
            <span
              className="passport-sticker -rotate-6"
              style={{ background: "#f2c14e" }}
            >
              No rankings
            </span>
            <span
              className="passport-sticker rotate-3"
              style={{ background: "var(--paper-blue)", color: "#fff" }}
            >
              No counts
            </span>
            <span
              className="passport-sticker -rotate-2"
              style={{ background: "#7ec4a7" }}
            >
              Skip anything
            </span>
            <span className="passport-sticker rotate-6" style={{ background: "#fff" }}>
              Every edge explained
            </span>
          </div>

          {/* Right-aligned detail columns, as on the reference back */}
          <div className="flex min-w-0 flex-1 flex-col justify-between border border-[color:var(--paper-rule)] p-4 text-right">
            <div>
              <BackBlock title="Interested in" items={features.academicInterests} />
              <BackBlock title="Can help with" items={features.skillsOffered} />
              <BackBlock title="Wants to learn" items={features.skillsWanted} />
              <BackBlock
                title="Outside class"
                items={[...features.hobbies, ...features.sports, ...features.movieGenres]}
              />
              {features.languages.length > 0 ? (
                <BackBlock title="Also speaks" items={features.languages} />
              ) : null}
            </div>

            {/* Issuing block anchored to the bottom so the panel never reads empty. */}
            <dl className="mt-4 space-y-1 border-t border-[color:var(--paper-rule)]/40 pt-3">
              {[
                ["Issued by", classroom.instructorName],
                ["Class", `${classroom.courseCode} · ${classroom.semester}`],
                ["Passport no.", serial],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-end gap-3">
                  <dt className="passport-label">{label}</dt>
                  <dd className="font-mono text-[0.66rem] font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="max-w-[16rem] font-mono text-[0.6rem] italic leading-relaxed">
            {passport.conversationStarter
              ? `“${passport.conversationStarter}”`
              : "“You are allowed to just say hello.”"}
          </p>
          <p className="font-mono text-[0.55rem] tracking-[0.12em] text-[color:var(--paper-faint)]">
            {classroom.name} · {serial}
          </p>
        </div>
      </div>
    </article>
  );
}

function BackBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3.5 last:mb-0">
      <p className="font-mono text-[0.58rem] italic text-[color:var(--paper-faint)]">
        {title}
      </p>
      <p className="mt-1 font-mono text-[0.7rem] font-semibold leading-relaxed">
        {items.join(", ")}
      </p>
    </div>
  );
}

function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--paper-blue)">
      <path d="M12 2l2.6 6.9L22 9.6l-5.4 4.7L18.2 22 12 18.1 5.8 22l1.6-7.7L2 9.6l7.4-.7z" />
    </svg>
  );
}
