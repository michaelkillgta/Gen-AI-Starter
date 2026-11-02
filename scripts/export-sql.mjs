// Writes the database as two plain SQL files to paste into Supabase's SQL Editor,
// for when running `pnpm db:seed` against Supabase isn't possible:
//
//   1-schema.sql    every migration in api/migrations (tables, row level security), each run once
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

// Supabase's SQL Editor can mangle long quoted text (posts are full of quotes,
// semicolons and dashes), so every piece of text goes in as base64 and Postgres
// decodes it. Columns that aren't plain text get a cast.
const CASTS = {
  week_of: "date",
  published_on: "date",
  stages: "jsonb",
  overview: "jsonb",
  body: "jsonb",
  try_it: "jsonb",
  interview: "jsonb",
  cover: "jsonb",
  featured: "jsonb",
  learn: "jsonb",
  facts: "jsonb",
};

const b64 = (s) => `convert_from(decode('${Buffer.from(String(s)).toString("base64")}', 'base64'), 'UTF8')`;

/** A value as an SQL expression, cast for its column when needed. */
function literal(v, column) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (Array.isArray(v)) return v.length ? `ARRAY[${v.map((x) => b64(x)).join(", ")}]` : "ARRAY[]::text[]";
  const cast = CASTS[column];
  return cast ? `${b64(v)}::${cast}` : b64(v);
}

/** Stands in for a pg client and writes each query, with its values filled in, as SQL. */
function recorder(lines) {
  return {
    async query(text, params = []) {
      // "INSERT INTO t (a, b, c) VALUES ($1, $2, $3)": which column each $n fills.
      const cols = text.match(/INSERT INTO \w+ \(([^)]*)\)/)?.[1].split(",").map((c) => c.trim()) ?? [];
      const sql = text.replace(/\$(\d+)/g, (_, n) => literal(params[Number(n) - 1], cols[Number(n) - 1]));
      lines.push(sql.trim().replace(/\n\s+/g, "\n  ") + ";");
      return { rows: [], rowCount: 0 };
    },
  };
}

fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const schema = [
  "-- GenAI Starter: tables. Run before 2-content.sql. Safe to run again: each step runs once.",
  "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());",
];
for (const f of files) {
  // Each migration (api/migrations/<f>) runs only if it hasn't yet, from base64 like the content.
  const version = f.split("_")[0];
  const body = fs.readFileSync(path.join(migrationsDir, f), "utf8").trim();
  schema.push(
    `\n-- ${f}`,
    "DO $migration$",
    "BEGIN",
    `  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '${version}') THEN`,
    `    EXECUTE ${b64(body)};`,
    `    INSERT INTO schema_migrations (version) VALUES ('${version}');`,
    "  END IF;",
    "END",
    "$migration$;",
  );
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
