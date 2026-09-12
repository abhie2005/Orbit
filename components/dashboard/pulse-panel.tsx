"use client";

import { useState } from "react";

import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import type { PulseSummary } from "@/lib/insights";

const SCALE = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

/**
 * Anonymous belonging pulse, before and after the activity (spec §10).
 *
 * Two entities compared on one axis, each row direct-labelled, so identity
 * never rests on colour. Deliberately framed as self-reported belonging — not
 * as proof that the graph created friendship.
 */
export function PulsePanel({
  before,
  after,
  onSimulate,
}: {
  before: PulseSummary | null;
  after: PulseSummary | null;
  onSimulate?: () => void | Promise<void>;
}) {
  const [running, setRunning] = useState(false);
  return (
    <Card className="p-6">
      <SectionLabel>Belonging pulse · anonymous</SectionLabel>
      <h2 className="mt-2.5 text-lg font-semibold">
        “I can identify at least one person in this class I would feel
        comfortable asking for help.”
      </h2>

      <div className="mt-6 space-y-5">
        <PulseRow
          label="Before the activity"
          summary={before}
          colorVar="var(--chart-3)"
        />
        <PulseRow
          label="After the activity"
          summary={after}
          colorVar="var(--chart-1)"
          emptyAction={
            onSimulate ? (
              <Button
                variant="secondary"
                className="px-4 py-2 text-sm"
                disabled={running}
                onClick={async () => {
                  // The round trip hits the database, so say so rather than
                  // letting the button sit there looking dead.
                  setRunning(true);
                  try {
                    await onSimulate();
                  } finally {
                    setRunning(false);
                  }
                }}
              >
                {running ? "Running…" : "Run the activity"}
              </Button>
            ) : null
          }
        />
      </div>

      {before && after ? (
        <p className="mt-6 rounded-none border-2 border-ink bg-bg/40 p-4 text-sm leading-relaxed text-muted">
          Agreement moved from{" "}
          <span className="font-mono text-ink">
            {Math.round(before.agreeShare * 100)}%
          </span>{" "}
          to{" "}
          <span className="font-mono text-ink">
            {Math.round(after.agreeShare * 100)}%
          </span>
          . That is what students reported about themselves — it is not a claim
          that Orbit created friendships.
        </p>
      ) : null}
    </Card>
  );
}

function PulseRow({
  label,
  summary,
  colorVar,
  emptyAction,
}: {
  label: string;
  summary: PulseSummary | null;
  colorVar: string;
  emptyAction?: React.ReactNode;
}) {
  if (!summary) {
    return (
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1.5 text-sm text-muted/70">Not collected yet.</p>
        {emptyAction ? <div className="mt-3">{emptyAction}</div> : null}
      </div>
    );
  }

  const pct = Math.round(summary.agreeShare * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ink">{label}</p>
        <p className="font-mono text-sm text-muted">
          <span className="text-ink">{pct}%</span> agree · mean {summary.mean} / 5 ·{" "}
          {summary.responses} responses
        </p>
      </div>

      <span
        className="mt-2 block h-3 w-full overflow-hidden rounded-none"
        style={{ background: "var(--chart-track)" }}
        role="img"
        aria-label={`${label}: ${pct} percent agree, mean ${summary.mean} out of 5, from ${summary.responses} anonymous responses`}
      >
        <span
          className="block h-full rounded-none"
          style={{ width: `${Math.max(3, pct)}%`, background: colorVar }}
        />
      </span>

      {/* 5-point distribution, so the mean is never the only thing on show. */}
      <ul className="mt-2.5 flex gap-[2px]">
        {summary.histogram.map((count, i) => (
          <li
            key={SCALE[i]}
            className="h-1.5 flex-1 rounded-none"
            style={{
              background: colorVar,
              opacity: count === 0 ? 0.12 : 0.25 + (count / summary.responses) * 0.75,
            }}
            title={`${SCALE[i]}: ${count}`}
          />
        ))}
      </ul>
      <p className="mt-1 flex justify-between text-[0.65rem] text-muted/70">
        <span>{SCALE[0]}</span>
        <span>{SCALE[4]}</span>
      </p>
    </div>
  );
}
