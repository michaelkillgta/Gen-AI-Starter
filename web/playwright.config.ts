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
  webServer: {
    command: `pnpm build && pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 240_000,
    env: { SHOW_STYLEGUIDE: "1" },
  },
});
