import { z } from "zod";
import { handle } from "@/lib/db/api";
import { getSnapshot, recordPulse } from "@/lib/db/repository";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Body = z.object({
  phase: z.enum(["before", "after"]),
  score: z.number().int().min(1).max(5),
});

/**
 * Anonymous belonging pulse. Deliberately takes no student id — spec §10
 * promises anonymity and the schema has no column to join on.
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "bad_request", issues: parsed.error.issues }, { status: 400 });
  }
  return handle(async () => {
    await recordPulse(DEMO_CLASSROOM.id, parsed.data.phase, parsed.data.score);
    return getSnapshot(DEMO_CLASSROOM.id);
  });
}
