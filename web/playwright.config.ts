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
      command: process.env.E2E_DATABASE_URL ? "cd ../api && cargo run -q -- seed && cargo run" : "cd ../api && cargo run",
      url: "http://127.0.0.1:8080/health",
      reuseExistingServer: true,
      timeout: 600_000,
      env: process.env.E2E_DATABASE_URL
        ? { STORAGE: "postgres", DATABASE_URL: process.env.E2E_DATABASE_URL, FORM_POSTS_PER_MINUTE: "100" }
        : { STORAGE: "files", DATA_DIR: path.join(os.tmpdir(), `ft-e2e-${Date.now()}`), FORM_POSTS_PER_MINUTE: "100" },
    },
    {
      command: `pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: true,
      timeout: 900_000,
      // Own build folder: `next build` into .next would replace the files a running
      // dev server is serving, and the dev site would lose its CSS.
      env: { SHOW_STYLEGUIDE: "1", NEXT_DIST_DIR: ".next-e2e" },
    },
  ],
});
