// Writes the database as two plain SQL files to paste into Supabase's SQL Editor,
// for when running `pnpm db:seed` against Supabase isn't possible:
//
//   1-schema.sql    every migration in api/migrations (tables, row level security)
//   2-content.sql   the site content from api/seed/*.json (replaces content, keeps signups)
//
//   pnpm db:sql                 writes them to .local/supabase/
//   node scripts/export-sql.mjs <folder>
import fs from "node:fs";
import path from "node:path";

import { root } from "./env.mjs";
import { loadIntoDatabase, loadSeed } from "./seed.mjs";

const outDir = path.resolve(process.argv[2] ?? path.join(root, ".local", "supabase"));
const migrationsDir = path.join(root, "api", "migrations");

/** A value as an SQL literal. */
function literal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (Array.isArray(v)) return `ARRAY[${v.map(literal).join(", ")}]::text[]`;
  return `'${String(v).replaceAll("'", "''")}'`;
}

/** Stands in for a pg client and writes each query, with its values filled in, as SQL. */
function recorder(lines) {
  return {
    async query(text, params = []) {
      const sql = text.replace(/\$(\d+)/g, (_, n) => literal(params[Number(n) - 1]));
      lines.push(sql.trim().replace(/\n\s+/g, "\n  ") + ";");
      return { rows: [], rowCount: 0 };
    },
  };
}

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const schema = [
  "-- GenAI Starter: tables. Run once on an empty Supabase database, before 2-content.sql.",
  "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());",
];
for (const f of files) {
  schema.push(`\n-- ${f}`, fs.readFileSync(path.join(migrationsDir, f), "utf8").trim());
  schema.push(`INSERT INTO schema_migrations (version) VALUES ('${f.split("_")[0]}') ON CONFLICT DO NOTHING;`);
}
// schema_migrations is created first, so the loop in 0007 already covers it; this is
// for databases set up before 0007 existed.
schema.push("\nALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;");
fs.writeFileSync(path.join(outDir, "1-schema.sql"), schema.join("\n") + "\n");

const content = ["-- GenAI Starter: site content from api/seed/*.json. Safe to run again; signups are kept."];
const seed = loadSeed();
await loadIntoDatabase(recorder(content), seed);
fs.writeFileSync(path.join(outDir, "2-content.sql"), content.join("\n") + "\n");

const kb = (f) => `${Math.round(fs.statSync(path.join(outDir, f)).size / 1024)} KB`;
console.log(`wrote ${outDir}\n  1-schema.sql (${kb("1-schema.sql")})\n  2-content.sql (${kb("2-content.sql")})`);
