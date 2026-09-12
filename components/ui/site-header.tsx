import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <OrbitMark />
          <span className="text-lg font-semibold tracking-tight">Orbit</span>
        </Link>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

export function OrbitMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.5"
        fill="none"
        stroke="var(--orbit-blue)"
        strokeWidth="1.6"
        transform="rotate(-28 16 16)"
        opacity="0.85"
      />
      <circle cx="16" cy="16" r="6" fill="var(--orbit-wine)" />
      <circle cx="27" cy="9.5" r="2.6" fill="var(--orbit-amber)" />
    </svg>
  );
}
