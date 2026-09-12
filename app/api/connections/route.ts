import { z } from "zod";
import { handle } from "@/lib/db/api";
import { getSnapshot, setConnectionStatus } from "@/lib/db/repository";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Body = z.object({
  studentAId: z.string().min(1),
  studentBId: z.string().min(1),
  status: z.enum(["suggested", "confirmed", "dismissed"]),
});

/** Confirm or dismiss an introduction — the dashed-to-solid transition. */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "bad_request", issues: parsed.error.issues }, { status: 400 });
  }
  const { studentAId, studentBId, status } = parsed.data;

  return handle(async () => {
    await setConnectionStatus(DEMO_CLASSROOM.id, studentAId, studentBId, status);
    return getSnapshot(DEMO_CLASSROOM.id);
  });
}
