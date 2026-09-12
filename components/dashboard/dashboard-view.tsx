"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarList } from "./bar-list";
import { AssignmentPlanner } from "./assignment-planner";
import { BridgePanel } from "./bridge-panel";
import { PulsePanel } from "./pulse-panel";
import { StatTile } from "./stat-tile";
import { Card, SectionLabel } from "@/components/ui/primitives";
import { classInsights } from "@/lib/insights";
import { simulateClassActivity, useOrbit } from "@/lib/store";

export function DashboardView() {
  const state = useOrbit();

  const insights = useMemo(
    () => classInsights(state.students, state.connections, state.pulses),
    [state.students, state.connections, state.pulses],
  );

  const roleItems = insights.roleDistribution
    .filter((entry) => entry.count > 0)
    .map((entry) => ({ label: entry.label, count: entry.count }));

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>
            {state.classroom.courseCode} · {state.classroom.instructorName} ·{" "}
            {state.classroom.semester}
          </SectionLabel>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {state.classroom.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Join code{" "}
            <span className="font-mono font-semibold tracking-[0.2em] text-blue">
              {state.classroom.joinCode}
            </span>
          </p>
        </div>
        <Link
          href="/constellation"
          className="rounded-none brut-press brut-shadow-sm border-2 border-ink bg-surface px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink"
        >
          Open the constellation
        </Link>
      </header>

      <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Passports completed"
          value={`${insights.passportsCompleted}`}
          detail={`of ${insights.studentCount} students in the class`}
        />
        <StatTile
          label="Introductions confirmed"
          value={`${insights.confirmedIntroductions}`}
          detail="Both students said they actually met"
          accent="var(--orbit-green)"
        />
        <StatTile
          label="Students with a connection"
          value={`${Math.round(insights.connectedShare * 100)}%`}
          detail="Have at least one confirmed introduction"
          accent="var(--orbit-wine)"
        />
        <StatTile
          label="Belonging agreement"
          value={
            insights.pulseAfter
              ? `${Math.round(insights.pulseAfter.agreeShare * 100)}%`
              : insights.pulseBefore
                ? `${Math.round(insights.pulseBefore.agreeShare * 100)}%`
                : "—"
          }
          detail={insights.pulseAfter ? "After the activity" : "Before the activity"}
          accent="var(--orbit-blue)"
        />
      </div>

      <p className="mt-3.5 text-xs leading-relaxed text-muted">
        Everything on this page is an aggregate. Orbit does not give you a list of
        students with few connections, and it never shows individual connection
        counts to anyone — including you.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <BarList
            title="What this class is into"
            subtitle="Academic interests students chose for themselves."
            items={insights.topInterests}
            colorVar="var(--chart-1)"
          />
        </Card>

        <Card className="p-6">
          <BarList
            title="Preferred project roles"
            subtitle="Useful when you are forming teams."
            items={roleItems}
            colorVar="var(--chart-2)"
          />
        </Card>

        <Card className="p-6 space-y-7">
          <BarList
            title="Skills students can teach"
            items={insights.skillsOffered}
            colorVar="var(--chart-4)"
          />
          <BarList
            title="Skills students want to learn"
            items={insights.skillsWanted}
            colorVar="var(--chart-3)"
          />
        </Card>

        <Card className="p-6">
          <BarList
            title="Where demand outstrips supply"
            subtitle="More students want to learn these than can currently teach them — worth a workshop or a pairing."
            items={insights.skillGaps}
            colorVar="var(--chart-2)"
            unit=""
            emptyLabel="Every skill someone wants, someone else can teach."
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4">
        <BridgePanel students={state.students} connections={state.connections} />
        <div className="mt-5">
          <AssignmentPlanner />
        </div>
        <PulsePanel
          before={insights.pulseBefore}
          after={insights.pulseAfter}
          onSimulate={simulateClassActivity}
        />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Prototype only. Fictional student data. Not reviewed for FERPA or any
        institutional privacy requirement.
      </p>
    </div>
  );
}
