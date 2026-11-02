import { DatabaseUnavailableError, databaseTarget, db } from "@/server/db";

const noStore = { "cache-control": "no-store" };

/**
 * GET /api/health: is the database reachable? When it isn't, `problem` says what
 * kind of failure it was (never the address or password), to make setup easier.
 */
export async function GET() {
  try {
    await db()`SELECT 1 FROM tools LIMIT 1`;
    return Response.json({ ok: true }, { headers: noStore });
  } catch (e) {
    const code = (e as { code?: string }).code;
    const problem =
      e instanceof DatabaseUnavailableError
        ? e.message
        : code === "28P01"
          ? "wrong database password"
          : code === "ENOTFOUND"
            ? "database address not found (use the Transaction pooler string)"
            : code === "CONNECT_TIMEOUT" || code === "ETIMEDOUT" || code === "ENETUNREACH"
              ? "could not reach the database (use the Transaction pooler string, port 6543)"
              : code === "42P01"
                ? "tables missing (run 1-schema.sql and 2-content.sql)"
                : `database error ${code ?? "unknown"}`;
    // The address and user it tried (never the password), to compare with Supabase.
    const t = databaseTarget();
    const tried = t ? { host: t.host, port: t.port, user: t.user, password_set: t.password !== "" } : null;
    return Response.json({ ok: false, problem, tried }, { status: 503, headers: noStore });
  }
}
