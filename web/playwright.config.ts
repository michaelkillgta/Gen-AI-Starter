import * as crypto from "node:crypto";

import { defineConfig } from "@playwright/test";

/** The four screen sizes every page is checked at. */
export const screens = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1024, height: 768 },
  { name: "large", width: 1440, height: 900 },
] as const;

const port = 3100;
// The tests use their own database (fieldtested_test, created by `pnpm db`), never
// the dev one, so test signups don't end up behind the dev site. It is re-seeded
// before every run.
const databaseUrl =
  process.env.E2E_DATABASE_URL ?? "postgres://fieldtested:fieldtested_dev@127.0.0.1:5433/fieldtested_test";

/** Admin password for the throwaway test site only (tests/screens/admin.spec.ts). */
export const E2E_ADMIN_PASSWORD = "e2e-only admin password";

// Node 24's built-in argon2 (newer than the installed @types/node).
type Argon2Sync = (
  algorithm: "argon2id",
  opts: { message: string; nonce: Buffer; tagLength: number; memory: number; passes: number; parallelism: number },
) => Buffer;
const argon2Sync = (crypto as unknown as { argon2Sync: Argon2Sync }).argon2Sync;

/** argon2id hash in PHC form. */
function adminHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const params = { memory: 19456, passes: 2, parallelism: 1 };
  const hash = argon2Sync("argon2id", { message: password, nonce: salt, tagLength: 32, ...params });
  const b64 = (b: Buffer) => b.toString("base64").replace(/=+$/, "");
  return `$argon2id$v=19$m=${params.memory},t=${params.passes},p=${params.parallelism}$${b64(salt)}$${b64(hash)}`;
}
// Base64, the way `pnpm admin:password` gives it (Next.js would rewrite the $ signs).
const e2eAdminHash = Buffer.from(adminHash(E2E_ADMIN_PASSWORD)).toString("base64");

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
      command: `node ../scripts/seed.mjs --test-reset && pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: true,
      timeout: 900_000,
      // Own build folder: `next build` into .next would replace the files a running
      // dev server is serving, and the dev site would lose its CSS.
      env: {
        SHOW_STYLEGUIDE: "1",
        NEXT_DIST_DIR: ".next-e2e",
        DATABASE_URL: databaseUrl,
        FORM_POSTS_PER_MINUTE: "100",
        ADMIN_PASSWORD_HASH: e2eAdminHash,
      },
    },
  ],
});
