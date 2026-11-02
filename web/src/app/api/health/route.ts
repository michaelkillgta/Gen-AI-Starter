import { db } from "@/server/db";

/** GET /api/health: is the database reachable? */
export async function GET() {
  try {
    await db()`SELECT 1`;
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
