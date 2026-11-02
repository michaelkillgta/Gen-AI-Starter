import "server-only";

import postgres from "postgres";

/**
 * The database connection (local Postgres, or Supabase in production).
 *
 * On Supabase use the pooled "Transaction" connection string (port 6543): each
 * serverless function then borrows a connection only while it runs. That pooler
 * can't keep prepared statements, so they are off.
 */

export class DatabaseUnavailableError extends Error {}

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export function db(): postgres.Sql {
  if (globalForDb.sql) return globalForDb.sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseUnavailableError("DATABASE_URL is not set");
  globalForDb.sql = postgres(url, {
    prepare: false,
    max: Number(process.env.DB_POOL_MAX ?? 3),
    idle_timeout: 20,
    connect_timeout: 10,
    // DATE columns as "YYYY-MM-DD" strings, the way the pages expect them.
    types: { date: { to: 1082, from: [1082], serialize: (v: string) => v, parse: (v: string) => v } },
    onnotice: () => {},
  });
  return globalForDb.sql;
}
