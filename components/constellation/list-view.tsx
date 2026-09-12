"use client";

import { EDGE_CATEGORIES, explainReasons } from "@/lib/matching";
import { PROJECT_ROLE_LABELS } from "@/lib/questions";
import { deriveFeatures } from "@/lib/privacy";
import type { StudentRecord } from "@/lib/seed-data";
import type { Connection } from "@/lib/types";
import { CATEGORY_GLYPH } from "./graph-types";

/**
 * The accessible peer of the graph (spec §7.6, §20) — not a fallback. Same
 * data, same explanations, fully keyboard reachable, no colour dependency.
 */
export function ListView({
  students,
  connections,
  names,
  currentStudentId,
  selectedStudentId,
  filteredIds,
  onSelectStudent,
}: {
  students: readonly StudentRecord[];
  connections: readonly Connection[];
  names: Record<string, string>;
  currentStudentId: string | null;
  selectedStudentId: string | null;
  filteredIds: ReadonlySet<string> | null;
  onSelectStudent: (id: string | null) => void;
}) {
  const visible = students.filter((r) => !filteredIds || filteredIds.has(r.student.id));

  return (
    <div className="h-full overflow-y-auto p-1">
      <ul className="space-y-2.5">
        {visible.map((record) => {
          const id = record.student.id;
          const features = deriveFeatures(record.answers);
          const own = connections.filter(
            (c) =>
              c.status !== "dismissed" && (c.studentAId === id || c.studentBId === id),
          );
          const isSelected = id === selectedStudentId;

          return (
            <li key={id}>
              <div
                className={`rounded-2xl border transition-colors ${
                  isSelected ? "border-blue/60 bg-surface" : "border-line bg-surface/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectStudent(isSelected ? null : id)}
                  aria-expanded={isSelected}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">
                        {record.student.displayName}
                      </span>
                      {id === currentStudentId ? (
                        <span className="rounded-full border border-amber/50 px-2 py-0.5 text-[0.65rem] text-amber">
                          you
                        </span>
                      ) : null}
                      {record.student.pronouns ? (
                        <span className="text-xs text-muted">
                          {record.student.pronouns}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {features.projectRoles[0]
                        ? PROJECT_ROLE_LABELS[features.projectRoles[0]]
                        : "Role not shared"}
                      {features.academicInterests.length > 0
                        ? ` · ${features.academicInterests.slice(0, 2).join(", ")}`
                        : ""}
                    </span>
                  </span>
                  <span aria-hidden="true" className="pt-1 text-muted">
                    {isSelected ? "−" : "+"}
                  </span>
                </button>

                {isSelected ? (
                  <div className="border-t border-line/70 px-4 py-3.5">
                    {own.length === 0 ? (
                      <p className="text-sm text-muted">
                        No suggested connections yet. Orbit only draws a line when it
                        can explain it.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {own.map((connection) => {
                          const otherId =
                            connection.studentAId === id
                              ? connection.studentBId
                              : connection.studentAId;
                          const category = connection.reasons[0]?.category ?? "academic";
                          const meta = EDGE_CATEGORIES[category];
                          return (
                            <li key={connection.id}>
                              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                                {names[otherId]}
                                <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-normal text-muted">
                                  <span aria-hidden="true">
                                    {CATEGORY_GLYPH[category]}{" "}
                                  </span>
                                  {meta.label}
                                </span>
                                <span className="text-[0.65rem] font-normal text-muted">
                                  {connection.status === "confirmed"
                                    ? "Both confirmed they met"
                                    : "Suggested"}
                                </span>
                              </p>
                              <ul className="mt-1 space-y-0.5">
                                {explainReasons(connection.reasons, names, id).map(
                                  (line) => (
                                    <li key={line} className="text-sm text-muted">
                                      {line}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
