import { handle } from "@/lib/db/api";
import { ensureSeeded } from "@/lib/db/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The whole classroom in one round trip. Seeds on first call. */
export async function GET() {
  return handle(() => ensureSeeded());
}
