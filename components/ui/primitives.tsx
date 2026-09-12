import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Tone = "wine" | "blue" | "amber" | "green" | "neutral";

/** Brutalist tags: ink rule, flat fill, square. Colour is never the only cue. */
const TONE_RING: Record<Tone, string> = {
  wine: "border-ink bg-wine/12 text-wine",
  blue: "border-ink bg-blue/12 text-blue",
  amber: "border-ink bg-amber/12 text-amber",
  green: "border-ink bg-green/12 text-green",
  neutral: "border-ink bg-surface-2 text-ink",
};

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag className={`brut brut-shadow ${className}`}>{children}</Tag>
  );
}

/** A slab, not a whisper — the label is a filled block of ink. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="brut-label">{children}</p>;
}

export function Tag({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 px-3 py-1 text-sm font-medium ${TONE_RING[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const BUTTON_BASE =
  "brut-press inline-flex items-center justify-center gap-2 border-2 border-ink px-6 py-3 text-base font-bold uppercase tracking-wide disabled:cursor-not-allowed";

const BUTTON_VARIANT = {
  primary: "bg-wine text-bg brut-shadow-sm",
  secondary: "bg-surface text-ink brut-shadow-sm",
  ghost: "border-transparent bg-transparent text-ink shadow-none hover:bg-surface-2",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button {...props} className={`${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${className}`} />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** Visible only to screen readers — used for the non-visual graph description. */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
