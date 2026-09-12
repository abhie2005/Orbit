"use client";

import { useRef, useState } from "react";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { planAssignmentGroups, type AssignmentPlan } from "@/lib/assistant";
import { PROJECT_ROLE_LABELS } from "@/lib/questions";
import { useOrbit } from "@/lib/store";

const EXAMPLE =
  "Group project: build a small React dashboard backed by Postgres that visualises campus energy use. Teams present findings in week 6 and submit a short written report.";

/**
 * Professor flow: paste or upload an assignment brief, get groups that can
 * actually do the work.
 *
 * The skills are read from the brief against Orbit's controlled vocabulary —
 * no model call, so this works with zero API keys and the professor can see
 * exactly which words were matched.
 */
export function AssignmentPlanner() {
  const state = useOrbit();
  const [brief, setBrief] = useState("");
  const [groupSize, setGroupSize] = useState(4);
  const [plan, setPlan] = useState<AssignmentPlan | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const names = Object.fromEntries(
    state.students.map((r) => [r.student.id, r.student.displayName]),
  );

  function run(text: string) {
    if (!text.trim()) return;
    setPlan(
      planAssignmentGroups(
        text,
        {
          students: state.students,
          connections: state.connections,
          currentStudentId: state.currentStudentId,
        },
        { groupSize },
      ),
    );
  }

  async function onFile(file: File) {
    setFileError(null);
    // Text formats only: parsing PDF/DOCX in the browser would mean shipping a
    // heavy dependency for a prototype, and silently failing on a scanned PDF
    // is worse than saying so.
    if (!/\.(txt|md|markdown|csv)$/i.test(file.name)) {
      setFileError(
        `${file.name} is not a plain-text file. Paste the brief below instead — .txt and .md are read directly.`,
      );
      setFileName(null);
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    setBrief(text);
    run(text);
  }

  return (
    <Card className="p-6">
      <SectionLabel>Assignment groups</SectionLabel>
      <h2 className="mt-3 text-2xl">Paste the brief, get the groups.</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Orbit reads the skills your brief names and builds groups that cover them,
        still favouring students who have not made an introduction yet. It shows you
        which words it matched — nothing is inferred.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.markdown,.csv,text/plain,text/markdown"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2 text-sm"
          onClick={() => fileRef.current?.click()}
        >
          Upload brief (.txt / .md)
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="px-3 py-2 text-sm"
          onClick={() => {
            setBrief(EXAMPLE);
            setFileName(null);
            run(EXAMPLE);
          }}
        >
          Use an example
        </Button>
        {fileName ? (
          <span className="font-mono text-xs text-muted">loaded: {fileName}</span>
        ) : null}
      </div>

      {fileError ? (
        <p role="alert" className="mt-3 border-2 border-ink bg-amber/15 px-3 py-2 text-sm">
          {fileError}
        </p>
      ) : null}

      <label htmlFor="brief" className="mt-5 block text-sm font-bold">
        Assignment brief
      </label>
      <textarea
        id="brief"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={5}
        placeholder="Paste the assignment description here…"
        className="mt-2 w-full border-2 border-ink bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-muted/60"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="group-size" className="text-sm font-bold">
          Group size
        </label>
        <select
          id="group-size"
          value={groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value))}
          className="border-2 border-ink bg-surface px-3 py-2 text-sm"
        >
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} students
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="px-5 py-2.5 text-sm"
          disabled={!brief.trim()}
          onClick={() => run(brief)}
        >
          Build groups
        </Button>
      </div>

      {plan ? (
        <div className="mt-6 border-t-2 border-ink pt-5">
          <p className="text-sm leading-relaxed">{plan.text}</p>

          {plan.skills.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {plan.skills.map((skill) => (
                <li
                  key={skill}
                  className="border-2 border-ink bg-blue/12 px-2.5 py-1 text-xs font-bold text-blue"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {plan.groups.map((group, i) => (
              <li key={group.id} className="border-2 border-ink bg-bg p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                  Group {i + 1} · {group.memberIds.length} students
                </p>
                <p className="mt-1.5 font-bold">
                  {group.memberIds.map((id) => names[id]).join(", ")}
                </p>
                {group.rolesCovered.length > 0 ? (
                  <p className="mt-1 text-xs text-muted">
                    {group.rolesCovered.map((r) => PROJECT_ROLE_LABELS[r]).join(" · ")}
                  </p>
                ) : null}
                <ul className="mt-2.5 space-y-1">
                  {group.rationale.map((line) => (
                    <li key={line} className="text-sm leading-relaxed text-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Greedy grouping, not a mathematically optimal one. Always worth a glance
            before you read it out.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
