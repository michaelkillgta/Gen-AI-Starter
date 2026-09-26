import { expect, test } from "@playwright/test";

import { screens } from "../../playwright.config";

/**
 * Phase 2 check: the site shell (header, nav, footer) and every shared UI piece
 * at each screen size. Full-page screenshots land in tests/screens/output/.
 */
const pages = [
  { path: "/styleguide", name: "styleguide" },
  { path: "/tracks", name: "inner-page" },
  { path: "/this-page-does-not-exist", name: "not-found" },
];

for (const screen of screens) {
  for (const page of pages) {
    test(`${page.name} @ ${screen.name} (${screen.width}px)`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: screen.width, height: screen.height } });
      const tab = await context.newPage();
      await tab.goto(page.path);
      await tab.evaluate(() => document.fonts.ready);

      // Nothing may scroll sideways at any size.
      const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(0);

      // Desktop shows the full menu; phone and tablet show the pill nav.
      const menuLink = tab.locator("header nav").first().getByRole("link", { name: "Toolkit" });
      if (screen.width >= 1024) await expect(menuLink).toBeVisible();
      else await expect(tab.getByRole("link", { name: "Home", exact: true })).toBeVisible();

      await tab.screenshot({ path: `tests/screens/output/${page.name}-${screen.width}.png`, fullPage: true });
      await context.close();
    });
  }
}
