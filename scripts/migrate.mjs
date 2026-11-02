// Applies api/migrations/*.sql in order, each once, and records them in
// schema_migrations. Works on the local database and on Supabase alike.
//
//   DATABASE_URL=postgres://... node scripts/migrate.mjs
//
// A database first set up by the old Rust API (sqlx) is picked up where it left off.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

import { databaseUrl } from "./env.mjs";

const dir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "api", "migrations");

export async function migrate(client) {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );
  // Databases the Rust API migrated already have 0001… applied.
  const { rows: sqlx } = await client.query("SELECT to_regclass('_sqlx_migrations') IS NOT NULL AS present");
  if (sqlx[0].present) {
    await client.query(
      `INSERT INTO schema_migrations (version)
       SELECT lpad(version::text, 4, '0') FROM _sqlx_migrations WHERE success
       ON CONFLICT DO NOTHING`,
    );
  }
  const done = new Set((await client.query("SELECT version FROM schema_migrations")).rows.map((r) => r.version));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const applied = [];
  for (const file of files) {
    const version = file.split("_")[0];
    if (done.has(version)) continue;
    await client.query("BEGIN");
    try {
      await client.query(fs.readFileSync(path.join(dir, file), "utf8"));
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw new Error(`${file}: ${e.message}`);
    }
    applied.push(file);
  }
  return applied;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    const applied = await migrate(client);
    console.log(applied.length ? `migrated: ${applied.join(", ")}` : "migrations: already up to date");
  } finally {
    await client.end();
  }
}
