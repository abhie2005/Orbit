import { z } from "zod";
import { handle } from "@/lib/db/api";
import { getSnapshot, rebuildConnections, upsertStudent } from "@/lib/db/repository";
import { DEMO_CLASSROOM } from "@/lib/seed-data";
import type { ProfileAnswer, QuestionKey } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Body = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(80),
  pronouns: z.string().max(40).optional(),
  meetingPreference: z.enum(["one_on_one", "small_group", "either"]),
  answers: z.record(z.string(), z.array(z.string().max(120)).max(20)),
});

/** Create or update a student, then recompute the class graph server-side. */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "bad_request", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  return handle(async () => {
    const answers: ProfileAnswer[] = Object.entries(body.answers)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => ({
        id: `ans_${body.id}_${key}`,
        studentId: body.id,
        questionKey: key as QuestionKey,
        values,
        visibility: "public" as const,
      }));

    await upsertStudent(
      {
        id: body.id,
        classroomId: DEMO_CLASSROOM.id,
        displayName: body.displayName,
        pronouns: body.pronouns,
        avatarSeed: body.id,
        meetingPreference: body.meetingPreference,
        isSeed: false,
        createdAt: new Date().toISOString(),
      },
      answers,
    );

    await rebuildConnections(DEMO_CLASSROOM.id);
    return getSnapshot(DEMO_CLASSROOM.id);
  });
}
