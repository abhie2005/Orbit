import { NextResponse } from "next/server";
import { hasDatabase } from "./client";

/** Route handlers touch the database, so they must never be prerendered. */
export const ROUTE_CONFIG = { dynamic: "force-dynamic", runtime: "nodejs" } as const;

export function noDatabase() {
  return NextResponse.json(
    {
      error: "no_database",
      message:
        "DATABASE_URL is not set. Provision Neon and run `vercel env pull .env.local --yes`.",
    },
    { status: 503 },
  );
}

/** One wrapper so every route reports failures the same way. */
export async function handle<T>(fn: () => Promise<T>) {
  if (!hasDatabase()) return noDatabase();
  try {
    return NextResponse.json(await fn());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[orbit:api]", message);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
