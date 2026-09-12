import { Card } from "@/components/ui/primitives";

/** A hero number. No plot, so no legend and no tooltip — just the figure. */
export function StatTile({
  label,
  value,
  detail,
  accent = "var(--orbit-ink)",
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        className="mt-2.5 text-4xl font-semibold tracking-tight tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </p>
      {detail ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{detail}</p> : null}
    </Card>
  );
}
