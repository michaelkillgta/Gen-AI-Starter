import * as crypto from "node:crypto";
import os from "node:os";
import path from "node:path";

import { defineConfig } from "@playwright/test";

/** The four screen sizes every page is checked at. */
export const screens = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1024, height: 768 },
  { name: "large", width: 1440, height: 900 },
] as const;

const port = 3100;
// The tests run their own API on 8090, never the dev API on 8080, so test signups
// don't end up in the local database behind the dev site.
const apiPort = 8090;
const apiUrl = `http://127.0.0.1:${apiPort}`;

/** Admin password for the throwaway test API only (tests/screens/admin.spec.ts). */
export const E2E_ADMIN_PASSWORD = "e2e-only admin password";

// Node 24's built-in argon2 (newer than the installed @types/node).
type Argon2Sync = (
  algorithm: "argon2id",
  opts: { message: string; nonce: Buffer; tagLength: number; memory: number; passes: number; parallelism: number },
) => Buffer;
const argon2Sync = (crypto as unknown as { argon2Sync: Argon2Sync }).argon2Sync;

/** argon2id hash in PHC form, the same format `pnpm admin:password` writes. */
function adminHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const params = { memory: 19456, passes: 2, parallelism: 1 };
  const hash = argon2Sync("argon2id", { message: password, nonce: salt, tagLength: 32, ...params });
  const b64 = (b: Buffer) => b.toString("base64").replace(/=+$/, "");
  return `$argon2id$v=19$m=${params.memory},t=${params.passes},p=${params.parallelism}$${b64(salt)}$${b64(hash)}`;
}
const e2eAdminHash = adminHash(E2E_ADMIN_PASSWORD);

export default defineConfig({
  testDir: "./tests/screens",
  outputDir: "./test-results",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: "chromium",
  },
  webServer: [
    {
      // The Rust API serves the content the pages render. With E2E_DATABASE_URL set it
      // runs on Postgres (seeded first); otherwise on the seed files, with test
      // signups in a throwaway folder, never the real api/data.
      command: process.env.E2E_DATABASE_URL
        ? "node ../scripts/cargo.mjs run -q -- seed && node ../scripts/cargo.mjs run"
        : "node ../scripts/cargo.mjs run",
      url: `${apiUrl}/health`,
      reuseExistingServer: true,
      timeout: 600_000,
      env: process.env.E2E_DATABASE_URL
        ? { API_BIND: `127.0.0.1:${apiPort}`, STORAGE: "postgres", DATABASE_URL: process.env.E2E_DATABASE_URL, FORM_POSTS_PER_MINUTE: "100", ADMIN_PASSWORD_HASH: e2eAdminHash }
        : { API_BIND: `127.0.0.1:${apiPort}`, STORAGE: "files", DATA_DIR: path.join(os.tmpdir(), `ft-e2e-${Date.now()}`), FORM_POSTS_PER_MINUTE: "100", ADMIN_PASSWORD_HASH: e2eAdminHash },
    },
    {
      command: `pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: true,
      timeout: 900_000,
      // Own build folder: `next build` into .next would replace the files a running
      // dev server is serving, and the dev site would lose its CSS.
      env: { SHOW_STYLEGUIDE: "1", NEXT_DIST_DIR: ".next-e2e", API_URL: apiUrl },
    },
  ],
});
