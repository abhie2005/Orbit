/**
 * Neon client.
 *
 * Lazily initialised: `neon()` throws when DATABASE_URL is missing, and Next
 * evaluates top-level module code at build time, so eager init crashes
 * `next build` before the database is provisioned.
 *
 * Deliberately a plain function, not a Proxy — Proxy wrappers break libraries
 * that introspect the client.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type OrbitDb = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run `vercel env pull .env.local --yes` after provisioning Neon.",
    );
  }
  return drizzle(neon(url), { schema });
}

let cached: OrbitDb | null = null;

export function getDb(): OrbitDb {
  if (!cached) cached = createDb();
  return cached;
}

/** True when a database is configured at all — lets routes fail politely. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
