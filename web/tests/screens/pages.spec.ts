import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { screens } from "../../playwright.config";

/**
 * Every page at every screen size: no sideways scrolling, no serious
 * accessibility problems, and a full-page screenshot in tests/screens/output/.
 * Set PAGES=home,toolkit to run a subset.
 */
const allPages = [
  { name: "home", path: "/" },
  { name: "toolkit", path: "/toolkit" },
  { name: "toolkit-filtered", path: "/toolkit?type=library&track=agents" },
  { name: "tool", path: "/toolkit/docling" },
  { name: "tracks", path: "/tracks" },
  { name: "track", path: "/tracks/gen-ai" },
  { name: "track-aiml", path: "/tracks/ai-ml" },
  { name: "dive", path: "/tracks/gen-ai/know-when-to-stop" },
  { name: "dive-short", path: "/tracks/gen-ai/what-an-llm-actually-is" },
  { name: "dive-tools", path: "/tracks/gen-ai/every-agent-needs-an-identity" },
  { name: "weekly", path: "/weekly" },
  { name: "weekly-archive", path: "/weekly/archive" },
  { name: "weekly-issue", path: "/weekly/1" },
  { name: "blog", path: "/blog" },
  { name: "blog-category", path: "/blog/category/agents" },
  { name: "blog-post", path: "/blog/memory-is-not-truth" },
  { name: "challenge", path: "/challenge" },
  { name: "challenge-joined", path: "/challenge/joined" },
  { name: "about", path: "/about" },
  { name: "suggest", path: "/suggest" },
  { name: "contact", path: "/contact" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
];

const only = process.env.PAGES?.split(",");
const pages = only ? allPages.filter((p) => only.includes(p.name)) : allPages;

for (const screen of screens) {
  test.describe(`${screen.name} ${screen.width}px`, () => {
    test.use({ viewport: { width: screen.width, height: screen.height } });

    for (const page of pages) {
      test(page.name, async ({ page: tab }) => {
        const res = await tab.goto(page.path);
        expect(res?.status(), `${page.path} status`).toBeLessThan(400);
        await tab.evaluate(() => document.fonts.ready);

        const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(0);

        await expect(tab.locator("h1")).toHaveCount(1);

        if (screen.name === "large" || screen.name === "phone") {
          const axe = await new AxeBuilder({ page: tab }).withTags(["wcag2a", "wcag2aa"]).analyze();
          const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
          expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
        }

        await tab.screenshot({ path: `tests/screens/output/${page.name}-${screen.width}.png`, fullPage: true });
      });
    }
  });
}
