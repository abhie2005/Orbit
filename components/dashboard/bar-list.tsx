import type { TagCount } from "@/lib/insights";

/**
 * A ranked horizontal bar list — magnitude for a single series, so no legend
 * and no second axis. Values are direct-labelled on every row because the list
 * is short and ranked; that removes the need for a hover tooltip to read a
 * number.
 */
export function BarList({
  title,
  subtitle,
  items,
  colorVar = "var(--chart-1)",
  unit = "",
  emptyLabel = "No answers yet.",
}: {
  title: string;
  subtitle?: string;
  items: TagCount[];
  colorVar?: string;
  unit?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <section>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted/70">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 space-y-2.5">
          {items.map((item) => (
            <li key={item.label} className="grid grid-cols-[11rem_1fr_2rem] items-center gap-3">
              <span className="truncate text-[0.8rem] text-muted" title={item.label}>
                {item.label}
              </span>
              <span
                className="h-2.5 w-full overflow-hidden rounded-none"
                style={{ background: "var(--chart-track)" }}
                role="presentation"
              >
                <span
                  className="block h-full rounded-none"
                  style={{
                    width: `${Math.max(4, (item.count / max) * 100)}%`,
                    background: colorVar,
                  }}
                />
              </span>
              <span className="text-right font-mono text-xs text-ink">
                {item.count}
                {unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
