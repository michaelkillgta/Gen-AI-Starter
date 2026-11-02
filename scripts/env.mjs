// Settings for the database scripts: the environment first, then web/.env.local
// (the website's own settings file), so `pnpm db:migrate` needs no extra setup.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const webEnvFile = path.join(root, "web", ".env.local");

/** KEY=value lines from a .env file (quotes stripped); {} when it doesn't exist. */
export function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

export function databaseUrl() {
  const url = process.env.DATABASE_URL || readEnvFile(webEnvFile).DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (put it in web/.env.local, see .env.example).");
    process.exit(1);
  }
  return url;
}
