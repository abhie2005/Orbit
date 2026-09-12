"use client";

/**
 * Galaxy interactive hero — the landing hero.
 *
 * Adapted from the 21st.dev "galaxy interactive hero section" block. The
 * composition is kept: a full-bleed interactive 3D field, a glass nav floating
 * on it, left-aligned hero type, and a framed panel that overlaps the fold and
 * parallaxes as you scroll. Everything else is Orbit's own system:
 *
 *   - hero copy is spec §11, verbatim
 *   - square corners, 2px rules, hard unblurred shadows (AGENTS.md brutalism)
 *   - the paper palette inverted — this is the one dark surface in the product
 *   - every animation is gated on prefers-reduced-motion (product invariant)
 *
 * The Spline scene is a decorative CDN asset. It is aria-hidden, it never
 * blocks paint, and if it fails to load — no network, or the viewer asked for
 * reduced motion — the hero falls back to a flat night field with the exposed
 * grid. Nothing on the demo path depends on it.
 */

import Link from "next/link";
import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { HeroConstellation } from "@/components/ui/hero-constellation";

const Spline = lazy(() => import("@splinetool/react-spline"));

const SPLINE_SCENE = "https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode";

/** Paper-on-dark inversion: ink rules become paper rules (#f5f2ea on #07060d).
    Tailwind cannot read a JS constant, so the paper hex is written literally in
    the class strings below; only the night value is shared with inline styles. */
const NIGHT = "#07060d";

/** Same 48px exposed grid as .orbit-sky, inverted. No round form, no texture. */
const NIGHT_FIELD = {
  backgroundColor: NIGHT,
  backgroundImage: `
    linear-gradient(to right, rgba(245, 242, 234, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(245, 242, 234, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: "48px 48px",
} as const;

const BUTTON_BASE =
  "inline-flex items-center justify-center border-2 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-[transform,box-shadow] duration-100 sm:text-base";

const BUTTON_PRIMARY = `${BUTTON_BASE} bg-wine text-[#f5f2ea] border-[#f5f2ea] shadow-[4px_4px_0_#f5f2ea] hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#f5f2ea] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#f5f2ea]`;

const BUTTON_SECONDARY = `${BUTTON_BASE} border-[#f5f2ea] text-[#f5f2ea] bg-[rgba(245,242,234,0.08)] backdrop-blur-[6px] hover:bg-[rgba(245,242,234,0.18)]`;

/**
 * True until measured, so the scene is never mounted during SSR and never
 * mounts at all for a viewer who asked for reduced motion.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/** A decorative background must never take the page down with it. */
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function HeroSplineBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={NIGHT_FIELD}>
      {reducedMotion || failed ? null : (
        <SceneBoundary onFail={() => setFailed(true)}>
          <Suspense fallback={null}>
            <div
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: ready ? 1 : 0 }}
            >
              <Spline
                scene={SPLINE_SCENE}
                onLoad={() => setReady(true)}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Suspense>
        </SceneBoundary>
      )}

      {/* Vignette: holds type contrast over any frame of the scene and hands
          the page off to the paper sections below. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(7, 6, 13, 0.94) 0%, rgba(7, 6, 13, 0.76) 28%, transparent 62%, transparent 74%, rgba(7, 6, 13, 0.78) 100%),
            linear-gradient(to bottom, rgba(7, 6, 13, 0.55) 0%, transparent 34%, rgba(7, 6, 13, 0.92) 92%)
          `,
        }}
      />
    </div>
  );
}

/** Orbit's nav in glass, scrolling away with the hero it sits on. */
function HeroNav() {
  return (
    <nav
      className="absolute inset-x-0 top-0 z-20 border-b-2 border-[rgba(245,242,234,0.22)]"
      style={{
        backgroundColor: "rgba(7, 6, 13, 0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href="/"
          className="type-display text-2xl leading-none text-[#f5f2ea] sm:text-[1.75rem]"
        >
          Orbit
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/professor/dashboard"
            className="px-4 py-2 text-sm font-semibold text-[#f5f2ea] hover:bg-[rgba(245,242,234,0.12)]"
          >
            Professor view
          </Link>
          <Link href="/join" className={`${BUTTON_SECONDARY} px-5 py-2 text-sm`}>
            Join a class
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroContent({ joinCode }: { joinCode: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5">
      <div className="max-w-3xl text-left text-[#f5f2ea]">
        <p className="inline-block border-2 border-[#f5f2ea] bg-[#f5f2ea] px-2.5 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#07060d]">
          First-day classroom belonging
        </p>

        <h1 className="mt-5 text-balance text-5xl leading-[1.03] tracking-tight sm:text-7xl">
          Find your people
          <br />
          in the room.
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[rgba(245,242,234,0.78)] sm:text-xl">
          Orbit transforms first-day introductions into student passports and a living
          classroom constellation.
        </p>

        <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
          <Link href="/join" className={BUTTON_PRIMARY}>
            Join a class
          </Link>
          <Link href="/professor/create" className={BUTTON_SECONDARY}>
            Create a class
          </Link>
        </div>

        <p className="mt-6 text-sm text-[rgba(245,242,234,0.7)]">
          Demo class{" "}
          <span className="font-mono font-semibold tracking-[0.2em] text-[#f5f2ea]">
            {joinCode}
          </span>{" "}
          is preloaded with twelve fictional students.
        </p>
      </div>
    </div>
  );
}

/**
 * The reference block parallaxes a product screenshot over the fold. Orbit has
 * no screenshot to show and will not pull a stranger's image off a CDN, so the
 * panel carries the constellation graphic on its own card stock instead — which
 * is also what bridges the dark hero into the paper page.
 */
function ConstellationPanel({
  panelRef,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="relative z-10 -mt-[14vh] px-5 pb-6 sm:pb-10">
      <div
        ref={panelRef}
        className="brut brut-shadow mx-auto w-full max-w-4xl p-7 will-change-transform sm:p-10"
        style={{ backgroundColor: "var(--orbit-bg)" }}
      >
        <p className="brut-label">The room, after day one</p>
        <div className="mt-8 flex justify-center">
          <HeroConstellation />
        </div>
        <p className="mt-8 text-balance text-lg leading-relaxed text-muted sm:text-xl">
          Twelve students, twenty-six connections, and not one of them drawn without a
          reason you can read in a sentence.
        </p>
      </div>
    </section>
  );
}

export function HeroSection({ joinCode }: { joinCode: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;

    if (reducedMotion) {
      // Reset, in case the preference was turned on mid-session.
      if (panel) panel.style.transform = "";
      if (content) content.style.opacity = "";
      return;
    }

    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (panel) {
          panel.style.transform = `translateY(-${Math.min(scrolled * 0.22, 72)}px)`;
        }
        if (content) {
          content.style.opacity = String(1 - Math.min(scrolled / 420, 1));
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div className="relative">
      {/* Content sits in normal flow, not absolutely, so a short viewport grows
          the hero instead of clipping the call to action. */}
      <section className="relative flex min-h-[100svh] w-full items-center overflow-hidden py-28">
        <HeroSplineBackground />
        <HeroNav />

        <div ref={contentRef} className="pointer-events-none relative z-10 w-full">
          <HeroContent joinCode={joinCode} />
        </div>
      </section>

      <ConstellationPanel panelRef={panelRef} />
    </div>
  );
}

export default HeroSection;
