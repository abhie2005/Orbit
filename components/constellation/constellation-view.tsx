"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConstellationGraph } from "./graph";
import { Legend } from "./legend";
import { ListView } from "./list-view";
import { MissionPanel } from "@/components/missions/mission-panel";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { EDGE_CATEGORIES, explainReasons } from "@/lib/matching";
import { deriveFeatures } from "@/lib/privacy";
import { PROJECT_ROLE_LABELS } from "@/lib/questions";
import { useOrbit } from "@/lib/store";
import { CATEGORY_GLYPH } from "./graph-types";

type ViewMode = "graph" | "list";

export function ConstellationView() {
  const state = useOrbit();
  const [mode, setMode] = useState<ViewMode>("graph");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const names = useMemo(
    () => Object.fromEntries(state.students.map((r) => [r.student.id, r.student.displayName])),
    [state.students],
  );

  const featuresById = useMemo(
    () =>
      Object.fromEntries(
        state.students.map((r) => [r.student.id, deriveFeatures(r.answers)]),
      ),
    [state.students],
  );

  /** The most common tags in the class — enough to explore, not overwhelming. */
  const filterTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const features of Object.values(featuresById)) {
      const tags = new Set([
        ...features.academicInterests,
        ...features.hobbies,
        ...features.skillsOffered,
        ...features.skillsWanted,
      ]);
      for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 9)
      .map(([tag]) => tag);
  }, [featuresById]);

  const filteredIds = useMemo(() => {
    if (!filterTag) return null;
    const ids = new Set<string>();
    for (const [id, features] of Object.entries(featuresById)) {
      const tags = [
        ...features.academicInterests,
        ...features.hobbies,
        ...features.skillsOffered,
        ...features.skillsWanted,
        ...features.movieGenres,
        ...features.sports,
      ];
      if (tags.includes(filterTag)) ids.add(id);
    }
    return ids;
  }, [filterTag, featuresById]);

  const selectedConnection = state.connections.find((c) => c.id === selectedConnectionId);
  const selectedRecord = state.students.find((r) => r.student.id === selectedStudentId);

  const hasStudents = state.students.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>
            {state.classroom.courseCode} · {state.classroom.semester}
          </SectionLabel>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {state.classroom.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Constellation view mode"
            className="flex rounded-none border-2 border-ink bg-surface-2 p-1"
          >
            {(["graph", "list"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={`rounded-none px-4 py-1.5 text-sm transition-colors ${
                  mode === value ? "bg-wine text-white" : "text-muted hover:text-ink"
                }`}
              >
                {value === "graph" ? "Constellation" : "List"}
              </button>
            ))}
          </div>
          <Link
            href="/professor/dashboard"
            className="rounded-none brut-press brut-shadow-sm border-2 border-ink bg-surface px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink"
          >
            Professor view
          </Link>
        </div>
      </header>

      {/* Filters. On phones these become one horizontally scrollable row —
          wrapping them costs five rows of height and pushes the graph off screen. */}
      <p className="mt-5 text-xs uppercase tracking-[0.16em] text-muted">Explore</p>
      <div className="-mx-5 mt-2 flex snap-x items-center gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {filterTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            aria-pressed={filterTag === tag}
            className={`shrink-0 snap-start rounded-none border px-3 py-1.5 text-sm transition-colors ${
              filterTag === tag
                ? "border-blue bg-blue/15 text-blue"
                : "border-ink bg-surface-2 text-muted hover:border-blue/50 hover:text-ink"
            }`}
          >
            {tag}
          </button>
        ))}
        {filterTag ? (
          <button
            onClick={() => setFilterTag(null)}
            className="shrink-0 rounded-none px-3 py-1.5 text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card className="overflow-hidden">
          <div className="h-[30rem] sm:h-[34rem] lg:h-[38rem]">
            {!hasStudents ? (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="max-w-sm text-muted">
                  Your constellation is still forming. Invite classmates with the class
                  code{" "}
                  <span className="font-mono text-blue">{state.classroom.joinCode}</span>.
                </p>
              </div>
            ) : mode === "graph" ? (
              <ConstellationGraph
                students={state.students}
                connections={state.connections}
                selectedStudentId={selectedStudentId}
                selectedConnectionId={selectedConnectionId}
                currentStudentId={state.currentStudentId}
                filteredIds={filteredIds}
                onSelectStudent={setSelectedStudentId}
                onSelectConnection={setSelectedConnectionId}
              />
            ) : (
              <ListView
                students={state.students}
                connections={state.connections}
                names={names}
                currentStudentId={state.currentStudentId}
                selectedStudentId={selectedStudentId}
                filteredIds={filteredIds}
                onSelectStudent={setSelectedStudentId}
              />
            )}
          </div>

          <div className="border-t-2 border-ink px-5 py-3.5">
            <Legend />
          </div>
        </Card>

        <aside className="space-y-4">
          <MissionPanel onFocusStudent={setSelectedStudentId} />

          {selectedConnection ? (
            <Card className="p-6">
              <SectionLabel>Why this connection</SectionLabel>
              <h2 className="mt-2.5 text-lg font-semibold">
                {names[selectedConnection.studentAId]} and{" "}
                {names[selectedConnection.studentBId]}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {explainReasons(
                  selectedConnection.reasons,
                  names,
                  state.currentStudentId ?? undefined,
                  4,
                ).map((line, i) => {
                  const reason = selectedConnection.reasons[i];
                  const meta = EDGE_CATEGORIES[reason.category];
                  return (
                    <li key={line} className="flex gap-2.5 text-sm leading-relaxed">
                      <span aria-hidden="true" style={{ color: meta.colorVar }}>
                        {CATEGORY_GLYPH[reason.category]}
                      </span>
                      <span>
                        <span className="text-ink">{line}</span>{" "}
                        <span className="text-muted">({meta.label.toLowerCase()})</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-muted">
                {selectedConnection.status === "confirmed"
                  ? "Both students confirmed they actually met."
                  : "Suggested. It becomes solid only when both say they met."}
              </p>
              <Button
                variant="ghost"
                className="mt-3 px-0 py-1 text-sm"
                onClick={() => setSelectedConnectionId(null)}
              >
                Close
              </Button>
            </Card>
          ) : selectedRecord ? (
            <Card className="p-6">
              <SectionLabel>Selected</SectionLabel>
              <h2 className="mt-2.5 text-lg font-semibold">
                {selectedRecord.student.displayName}
                {selectedRecord.student.pronouns ? (
                  <span className="ml-2 text-sm font-normal text-muted">
                    {selectedRecord.student.pronouns}
                  </span>
                ) : null}
              </h2>

              {(() => {
                const features = featuresById[selectedRecord.student.id];
                return (
                  <div className="mt-4 space-y-3.5 text-sm">
                    {features.projectRoles[0] ? (
                      <p className="text-muted">
                        Prefers to work as a{" "}
                        <span className="text-ink">
                          {PROJECT_ROLE_LABELS[features.projectRoles[0]].toLowerCase()}
                        </span>
                        .
                      </p>
                    ) : null}
                    <TagRow title="Interested in" items={features.academicInterests} />
                    <TagRow title="Can help with" items={features.skillsOffered} />
                    <TagRow title="Wants to learn" items={features.skillsWanted} />
                  </div>
                );
              })()}

              <p className="mt-5 text-xs text-muted">
                Click any line touching this node to see exactly why it exists.
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <SectionLabel>How to read this</SectionLabel>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
                <li>Select a student to centre them and see only their connections.</li>
                <li>Select a line to read, in plain words, why Orbit drew it.</li>
                <li>
                  Every node is the same size. Orbit does not show or rank how connected
                  anyone is.
                </li>
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function TagRow({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{title}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-none border-2 border-ink bg-surface-2 px-2.5 py-0.5 text-xs text-ink"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
