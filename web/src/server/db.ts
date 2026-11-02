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

type Target = { host: string; port: number; user: string; password: string; database: string };

/**
 * DATABASE_URL, read forgivingly: quotes and spaces around it are ignored, and the
 * password may contain characters like @ # / ? that would break a normal URL
 * (the host is whatever follows the last @). DATABASE_PASSWORD, when set, is used
 * as the password instead, so it never has to go inside the link.
 */
export function databaseTarget(): Target | null {
  // Also finds the link inside a pasted "DATABASE_URL=..." line or a psql command.
  const raw = process.env.DATABASE_URL?.match(/postgres(?:ql)?:\/\/[^\s'"]+/)?.[0];
  if (!raw) return null;
  const m = raw.match(/^postgres(?:ql)?:\/\/(.*)@([^@/:?]+)(?::(\d+))?(?:\/([^?]*))?/);
  if (!m) return null;
  const [, auth, host, port, database] = m;
  const colon = auth.indexOf(":");
  const user = decodeURIComponent(colon < 0 ? auth : auth.slice(0, colon));
  let password = colon < 0 ? "" : auth.slice(colon + 1);
  try {
    password = decodeURIComponent(password);
  } catch {
    // a raw password with a lone % in it: use it as typed
  }
  return {
    host,
    port: Number(port ?? 5432),
    user,
    password: process.env.DATABASE_PASSWORD || password,
    database: database || "postgres",
  };
}

export function db(): postgres.Sql {
  if (globalForDb.sql) return globalForDb.sql;
  const target = databaseTarget();
  if (!target) {
    throw new DatabaseUnavailableError(
      process.env.DATABASE_URL?.trim()
        ? `DATABASE_URL isn't a postgresql:// link: it starts with "${process.env.DATABASE_URL.trim().slice(0, 14)}" (use the Transaction pooler string)`
        : "DATABASE_URL is not set",
    );
  }
  globalForDb.sql = postgres({
    ...target,
    // Supabase needs encrypted connections; the local database has none.
    ssl: /^(localhost|127\.0\.0\.1|::1)$/.test(target.host) ? false : "require",
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
