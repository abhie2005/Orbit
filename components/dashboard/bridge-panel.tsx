"use client";

import { useMemo, useState } from "react";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { bridgeTheClass, type BridgeGroup } from "@/lib/grouping";
import { confirmedDegrees, pairKey } from "@/lib/matching";
import { deriveFeatures } from "@/lib/privacy";
import type { StudentRecord } from "@/lib/seed-data";
import type { Connection } from "@/lib/types";

/**
 * Bridge the Class (spec §7.8).
 *
 * The professor sees WHY each group was proposed and can move anyone before
 * publishing. Students who have not made a confirmed introduction are
 * prioritised by the algorithm, but they are never identified as such in the
 * UI — the reason lines only ever talk about shared ground and roles.
 */
export function BridgePanel({
  students,
  connections,
}: {
  students: readonly StudentRecord[];
  connections: readonly Connection[];
}) {
  const [groupSize, setGroupSize] = useState(3);
  const [overrides, setOverrides] = useState<Record<string, string> | null>(null);

  const scorables = useMemo(
    () =>
      students.map((r) => ({
        id: r.student.id,
        displayName: r.student.displayName,
        features: deriveFeatures(r.answers),
      })),
    [students],
  );

  const names = useMemo(
    () => Object.fromEntries(students.map((r) => [r.student.id, r.student.displayName])),
    [students],
  );

  const generated = useMemo(() => {
    const recent = new Set<string>();
    for (const c of connections) {
      if (c.status === "confirmed") recent.add(pairKey(c.studentAId, c.studentBId));
    }
    return bridgeTheClass(scorables, {
      groupSize,
      confirmedDegree: confirmedDegrees(
        students.map((r) => r.student.id),
        connections,
      ),
      recentPairs: recent,
    });
  }, [scorables, connections, students, groupSize]);

  // Manual override: a map of studentId -> groupId layered over the generated plan.
  const groups: BridgeGroup[] = useMemo(() => {
    if (!overrides) return generated;
    const byId = new Map(generated.map((g) => [g.id, { ...g, memberIds: [] as string[] }]));
    for (const group of generated) {
      for (const memberId of group.memberIds) {
        const targetId = overrides[memberId] ?? group.id;
        (byId.get(targetId) ?? byId.get(group.id))!.memberIds.push(memberId);
      }
    }
    return [...byId.values()].filter((g) => g.memberIds.length > 0);
  }, [generated, overrides]);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionLabel>Bridge the class</SectionLabel>
          <h2 className="mt-2.5 text-lg font-semibold">Suggested groups for today</h2>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">
            Built to mix people who have not worked together, cover different
            project roles, and give everyone at least one thing to open with.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          Group size
          <select
            value={groupSize}
            onChange={(e) => {
              setGroupSize(Number(e.target.value));
              setOverrides(null);
            }}
            className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-ink"
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 grid gap-3.5 lg:grid-cols-2">
        {groups.map((group, index) => (
          <li
            key={group.id}
            className="rounded-2xl border border-line bg-bg/40 p-4"
            style={{ borderLeftWidth: 3, borderLeftColor: groupColor(index) }}
          >
            <h3 className="text-sm font-semibold text-ink">
              Group {index + 1}
              <span className="ml-2 font-normal text-muted">
                {group.memberIds.length} students
              </span>
            </h3>

            <ul className="mt-3 space-y-1.5">
              {group.memberIds.map((memberId) => (
                <li key={memberId} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-ink">{names[memberId]}</span>
                  <label className="text-xs text-muted">
                    <span className="sr-only">Move {names[memberId]} to another group</span>
                    <select
                      value={group.id}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, [memberId]: e.target.value }))
                      }
                      className="rounded-full border border-line bg-surface-2 px-2 py-1 text-xs text-muted"
                    >
                      {generated.map((g, i) => (
                        <option key={g.id} value={g.id}>
                          Group {i + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>

            <ul className="mt-3 space-y-1 border-t border-line/70 pt-3">
              {group.rationale.map((line) => (
                <li key={line} className="text-xs leading-relaxed text-muted">
                  {line}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          className="px-4 py-2 text-sm"
          onClick={() => setOverrides(null)}
          disabled={!overrides}
        >
          Reset manual changes
        </Button>
        <p className="text-xs text-muted">
          Greedy grouping, not a mathematically optimal one. Always worth a glance
          before you read it out.
        </p>
      </div>
    </Card>
  );
}

function groupColor(index: number): string {
  return ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"][index % 4];
}
