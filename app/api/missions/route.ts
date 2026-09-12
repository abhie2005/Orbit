import { z } from "zod";
import { handle } from "@/lib/db/api";
import { getSnapshot, saveMissions } from "@/lib/db/repository";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Body = z.object({
  missions: z
    .array(
      z.object({
        id: z.string().min(1),
        participantIds: z.array(z.string().min(1)).min(1).max(8),
        title: z.string().min(1).max(200),
        prompt: z.string().min(1).max(600),
        reason: z.string().min(1).max(600),
        connectionId: z.string().optional(),
        status: z.enum(["active", "completed", "skipped"]),
      }),
    )
    .max(50),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "bad_request", issues: parsed.error.issues }, { status: 400 });
  }
  return handle(async () => {
    await saveMissions(
      parsed.data.missions.map((m) => ({ ...m, classroomId: DEMO_CLASSROOM.id })),
    );
    return getSnapshot(DEMO_CLASSROOM.id);
  });
}
