import { handle } from "@/lib/db/api";
import { resetToSeed } from "@/lib/db/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Demo reset (spec §23.12) — back to the pristine seeded class. */
export async function POST() {
  return handle(() => resetToSeed());
}
