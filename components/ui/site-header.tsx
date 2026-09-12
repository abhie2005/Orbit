import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Wordmark only — no icon. The name carries the brand. */}
        <Link
          href="/"
          className="type-display text-2xl leading-none text-ink sm:text-[1.75rem]"
        >
          Orbit
        </Link>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
