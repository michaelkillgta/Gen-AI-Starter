import { getAdminData } from "@/features/admin/server";
import { TABLES, isTableKey, rowsOf, toCsv } from "@/features/admin/tables";

/** GET /admin/export/<table>: that table as a CSV download, for the signed-in admin only. */
export async function GET(_req: Request, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  if (!isTableKey(table)) return new Response("Not found", { status: 404 });

  const result = await getAdminData();
  if (!result.ok) {
    return new Response(result.reason === "signed-out" ? "Please sign in at /admin/login" : "API not reachable", {
      status: result.reason === "signed-out" ? 401 : 503,
      headers: { "cache-control": "no-store" },
    });
  }

  const def = TABLES.find((t) => t.key === table)!;
  const date = new Date().toISOString().slice(0, 10);
  // A byte-order mark so Excel opens Indian names and emoji correctly.
  const body = "﻿" + toCsv(def.columns, rowsOf(result.data, table));
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="field-tested-${table}-${date}.csv"`,
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
