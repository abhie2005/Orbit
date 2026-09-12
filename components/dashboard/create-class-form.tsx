"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink, Card, SectionLabel } from "@/components/ui/primitives";
import { CORE_QUESTIONS, BONUS_QUESTIONS } from "@/lib/questions";
import { createClassroom, resetDemo } from "@/lib/store";
import type { Classroom } from "@/lib/types";

export function CreateClassForm() {
  const [created, setCreated] = useState<Classroom | null>(null);
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    instructorName: "",
    semester: "Fall 2026",
    approxSize: "30",
    welcomeMessage: "",
  });

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  if (created) {
    return (
      <Card className="w-full max-w-xl p-8 text-center">
        <SectionLabel>Class created</SectionLabel>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{created.name}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {created.courseCode} · {created.semester}
        </p>

        <p className="mt-7 text-sm text-muted">Show this code to the room</p>
        <p className="mt-2 font-mono text-5xl font-semibold tracking-[0.2em] text-blue">
          {created.joinCode}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/professor/dashboard">Open dashboard</ButtonLink>
          <ButtonLink href="/constellation" variant="secondary">
            Show the constellation
          </ButtonLink>
        </div>

        <p className="mt-7 border-t-2 border-ink pt-5 text-xs leading-relaxed text-muted">
          Your class starts empty, so the constellation will be empty until
          students join.{" "}
          <button
            type="button"
            onClick={() => {
              resetDemo();
              setCreated(null);
            }}
            className="text-blue underline underline-offset-4"
          >
            Restore the seeded demo class
          </button>{" "}
          to get the twelve fictional students back.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl p-8">
      <SectionLabel>Create a class</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Set up your classroom
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Orbit will generate a join code and a private constellation for this class
        only.
      </p>

      <form
        className="mt-7 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setCreated(
            createClassroom({
              ...form,
              approxSize: Number(form.approxSize) || undefined,
            }),
          );
        }}
      >
        <Field label="Class name" id="name" required>
          <input
            id="name"
            required
            placeholder="Human-Centered Computing"
            {...field("name")}
            className={INPUT}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Course code" id="courseCode">
            <input id="courseCode" placeholder="CS 2340" {...field("courseCode")} className={INPUT} />
          </Field>
          <Field label="Semester" id="semester">
            <input id="semester" {...field("semester")} className={INPUT} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instructor name" id="instructorName">
            <input
              id="instructorName"
              placeholder="Prof. Rivera"
              {...field("instructorName")}
              className={INPUT}
            />
          </Field>
          <Field label="Approximate class size" id="approxSize">
            <input
              id="approxSize"
              type="number"
              min={2}
              max={500}
              {...field("approxSize")}
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Welcome message" id="welcomeMessage" optional>
          <textarea
            id="welcomeMessage"
            rows={2}
            placeholder="Welcome. You will work with almost everyone in this room at some point."
            {...field("welcomeMessage")}
            className={INPUT}
          />
        </Field>

        <div className="rounded-none border-2 border-ink bg-bg/40 p-4">
          <p className="text-sm font-medium text-ink">Onboarding questions</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {CORE_QUESTIONS.length} core questions, plus {BONUS_QUESTIONS.length}{" "}
            optional extras students can add if they want better matches. Every
            question except the display name is skippable.
          </p>
        </div>

        <div className="rounded-none border border-amber/35 bg-amber/10 p-4">
          <p className="text-xs leading-relaxed text-amber">
            Creating a class replaces the seeded demo class on this device. You can
            restore it at any time with the reset control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit">Create class</Button>
          <Link href="/professor/dashboard" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            Or open the seeded demo class
          </Link>
        </div>
      </form>
    </Card>
  );
}

const INPUT =
  "mt-2 w-full rounded-none border-2 border-ink bg-surface-2 px-4 py-3 text-ink placeholder:text-muted/40";

function Field({
  label,
  id,
  children,
  optional,
  required,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-muted"> — optional</span> : null}
        {required ? <span className="text-amber"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
