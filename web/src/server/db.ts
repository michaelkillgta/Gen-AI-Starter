import "server-only";

import pg from "pg";

/**
 * The database connection (local Postgres, or Supabase in production).
 *
 * On Supabase use the pooled "Transaction" connection string (port 6543): each
 * serverless function then borrows a connection only while it runs. node-postgres
 * sends one query at a time per connection and uses no named prepared statements,
 * which is what that pooler needs. (postgres.js sent several queries at once on a
 * connection; through the pooler that hung pages and mixed up answers.)
 *
 * Queries are written as tagged templates, sql`SELECT … WHERE x = ${value}`; the
 * values are sent as parameters, never pasted into the SQL.
 */

export class DatabaseUnavailableError extends Error {}

export type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface Sql {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]>;
  /** Runs `fn` in a transaction on one connection; rolls back if it throws. */
  begin<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
}

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

const DATE_OID = 1082;
// DATE columns as "YYYY-MM-DD" strings, the way the pages expect them.
const types = {
  getTypeParser: ((oid: number, format?: string) =>
    oid === DATE_OID ? (v: string) => v : pg.types.getTypeParser(oid, format as "text")) as typeof pg.types.getTypeParser,
};

/** sql`…${a}…${b}` → "…$1…$2" and [a, b]. */
function toQuery(strings: TemplateStringsArray, values: unknown[]) {
  return { text: strings.reduce((acc, s, i) => acc + `$${i}` + s), values };
}

function tagFor(run: (q: { text: string; values: unknown[] }) => Promise<Row[]>, pool: pg.Pool): Sql {
  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) => run(toQuery(strings, values))) as Sql;
  sql.begin = async (fn) => {
    const client = await pool.connect();
    const inTx = tagFor(async (q) => (await client.query(q)).rows, pool);
    try {
      await client.query("BEGIN");
      const out = await fn(inTx);
      await client.query("COMMIT");
      return out;
    } catch (e) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  };
  return sql;
}

const globalForDb = globalThis as unknown as { sql?: Sql };

export function db(): Sql {
  if (globalForDb.sql) return globalForDb.sql;
  const target = databaseTarget();
  if (!target) {
    throw new DatabaseUnavailableError(
      process.env.DATABASE_URL?.trim()
        ? `DATABASE_URL isn't a postgresql:// link: it starts with "${process.env.DATABASE_URL.trim().slice(0, 14)}" (use the Transaction pooler string)`
        : "DATABASE_URL is not set",
    );
  }
  const pool = new pg.Pool({
    ...target,
    // Supabase needs encrypted connections; the local database has none.
    ssl: /^(localhost|127\.0\.0\.1|::1)$/.test(target.host) ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    // Never leave a page waiting forever on one slow query.
    query_timeout: 20_000,
    types,
  });
  // A dropped idle connection must not crash the server.
  pool.on("error", (e) => console.error("database pool:", e.message));
  globalForDb.sql = tagFor(async (q) => (await pool.query(q)).rows, pool);
  return globalForDb.sql;
}
