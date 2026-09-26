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
      // The Rust API serves the content the pages render.
      command: "cd ../api && cargo run",
      url: "http://127.0.0.1:8080/health",
      reuseExistingServer: true,
      timeout: 600_000,
      // Test signups go to a throwaway folder, never the real api/data.
      env: { DATA_DIR: path.join(os.tmpdir(), `ft-e2e-${Date.now()}`), FORM_POSTS_PER_MINUTE: "100" },
    },
    {
      command: `pnpm build && pnpm start -p ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: true,
      timeout: 300_000,
      env: { SHOW_STYLEGUIDE: "1" },
    },
  ],
});
