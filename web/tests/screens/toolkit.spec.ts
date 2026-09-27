import { expect, test } from "@playwright/test";

/** /toolkit shows tools as blocks: short per area, details when you pick one. */
test.describe("toolkit blocks", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("areas fold to 6 blocks, pick a block to see its details", async ({ page }) => {
    await page.goto("/toolkit");
    const agents = page.getByRole("region", { name: "Build agents that don't break", exact: true });
    await expect(agents.locator(":scope > ul > li")).toHaveCount(6);
    await agents.getByRole("button", { name: "Show all 10 tools in Agents that don't break" }).click();
    await expect(agents.locator(":scope > ul > li")).toHaveCount(10);

    // Picking a block shows it in the side panel and keeps it in the address.
    await page.getByRole("button", { name: /Docling/, pressed: false }).first().click();
    const panel = page.getByRole("complementary", { name: "Docling details" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "Open the Docling page" })).toHaveAttribute("href", "/toolkit/docling");
    await expect(page).toHaveURL(/tool=docling/);
  });

  test("a shared link opens the tool's details", async ({ page }) => {
    await page.goto("/toolkit?tool=promptfoo");
    await expect(page.getByRole("complementary", { name: "Promptfoo details" })).toBeVisible();
  });

  test("search shows every match, no folding", async ({ page }) => {
    await page.goto("/toolkit?q=mcp");
    await expect(page.getByRole("button", { name: /^Show all/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /of 28 tools/ })).toBeVisible();
  });
});
