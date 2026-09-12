"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetDemo } from "@/lib/store";

/** Spec §23.12 — the presentation must be rehearsable end to end, repeatedly. */
export function DemoReset() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-none brut-press brut-shadow-sm border-2 border-ink bg-surface px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-ink"
      >
        Reset demo
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          resetDemo();
          router.push("/");
        }}
        className="rounded-none border border-amber/60 bg-amber/10 px-3.5 py-1.5 text-xs text-amber"
      >
        Confirm reset
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-none px-2 py-1.5 text-xs text-muted hover:text-ink"
      >
        Cancel
      </button>
    </span>
  );
}
