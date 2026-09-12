import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Tone = "violet" | "blue" | "amber" | "green" | "neutral";

const TONE_RING: Record<Tone, string> = {
  violet: "border-violet/40 bg-violet/10 text-violet",
  blue: "border-blue/40 bg-blue/10 text-blue",
  amber: "border-amber/40 bg-amber/10 text-amber",
  green: "border-green/40 bg-green/10 text-green",
  neutral: "border-line bg-surface-2 text-muted",
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
    <Tag
      className={`rounded-card border border-line/80 bg-surface/70 backdrop-blur-sm ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </p>
  );
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${TONE_RING[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const BUTTON_VARIANT = {
  primary: "bg-violet text-white hover:bg-violet/85",
  secondary: "border border-line bg-surface-2 text-ink hover:border-blue/60 hover:bg-surface",
  ghost: "text-muted hover:text-ink",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${className}`}
    />
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
