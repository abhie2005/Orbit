import { eq } from "drizzle-orm";
import { handle } from "@/lib/db/api";
import { getDb } from "@/lib/db/client";
import { getSnapshot } from "@/lib/db/repository";
import * as t from "@/lib/db/schema";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AFTER_PULSE = [4, 5, 4, 4, 3, 5, 4, 5, 4, 4, 5, 3, 4, 5, 4, 4, 5, 4, 3, 5, 4, 4, 5, 4];

/**
 * "Run the activity" — simulate the rest of the class meeting each other so the
 * before/after belonging story has an after. Demo affordance, clearly labelled
 * as such in the UI.
 */
export async function POST() {
  return handle(async () => {
    const db = getDb();
    const id = DEMO_CLASSROOM.id;

    const rows = await db.select().from(t.connections).where(eq(t.connections.classroomId, id));
    const toConfirm = rows.filter((r, i) => r.status === "suggested" && i % 2 === 0);
    for (const row of toConfirm) {
      await db.update(t.connections).set({ status: "confirmed" }).where(eq(t.connections.id, row.id));
    }

    await db
      .delete(t.belongingPulses)
      .where(eq(t.belongingPulses.classroomId, id));
    const before = (await import("@/lib/seed-data")).SEED_PULSE_BEFORE;
    await db.insert(t.belongingPulses).values([
      ...before.map((score, i) => ({
        id: `pulse_before_${i}`,
        classroomId: id,
        phase: "before" as const,
        score,
      })),
      ...AFTER_PULSE.map((score, i) => ({
        id: `pulse_after_${i}`,
        classroomId: id,
        phase: "after" as const,
        score,
      })),
    ]);

    return getSnapshot(id);
  });
}
