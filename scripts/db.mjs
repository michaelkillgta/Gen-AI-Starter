// Local PostgreSQL 17 without Docker or an installer, using the embedded-postgres
// npm package. Used on this laptop because Docker Desktop won't start (see
// docs/decisions.md). On a machine with Docker, `docker compose up -d db` works too.
//
//   node scripts/db.mjs          start (creates the cluster and database on first run)
//   node scripts/db.mjs test     start and create the throwaway "fieldtested_test" database too
//
// Data lives outside OneDrive (a live database must not be synced while running).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const dataDir = process.env.PGDATA_DIR ?? path.join(os.homedir(), ".cache", "field-tested-pgdata");
const port = Number(process.env.PGPORT ?? 5433);
const user = "fieldtested";
const password = "fieldtested_dev"; // local development only

const server = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"], // Windows would otherwise pick WIN1252
  onLog: () => {},
});

const fresh = !fs.existsSync(path.join(dataDir, "PG_VERSION"));
if (fresh) {
  console.log(`db: creating cluster in ${dataDir}`);
  await server.initialise();
}
await server.start();

const wanted = ["fieldtested", ...(process.argv.includes("test") ? ["fieldtested_test"] : [])];
const admin = new pg.Client({ host: "127.0.0.1", port, user, password, database: "postgres" });
await admin.connect();
for (const name of wanted) {
  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
  if (!rowCount) {
    await admin.query(`CREATE DATABASE ${name}`);
    console.log(`db: created database ${name}`);
  }
}
await admin.end();
console.log(`db: PostgreSQL 17 ready on 127.0.0.1:${port} (Ctrl+C to stop)`);

const stop = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
