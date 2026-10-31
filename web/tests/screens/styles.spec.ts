import { expect, test, type Locator } from "@playwright/test";

/**
 * Checks the styles actually applied in the browser, not just the markup, so a
 * missing or stale stylesheet fails the tests instead of showing a plain list.
 */
async function computed(el: Locator, props: string[]) {
  return el.evaluate((node, names) => {
    const s = getComputedStyle(node);
    return Object.fromEntries(names.map((n) => [n, s.getPropertyValue(n)]));
  }, props);
}

for (const width of [375, 1440]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("deep dive tool buttons are outlined boxes on one line", async ({ page }) => {
      await page.goto("/tracks/gen-ai/an-agent-is-more-than-a-chatbot");
      const section = page.locator("section", { has: page.getByRole("heading", { name: "Tools used" }) });
      const list = section.getByRole("list");
      expect((await computed(list, ["list-style-type"]))["list-style-type"]).toBe("none");

      const buttons = section.getByRole("link");
      await expect(buttons).toHaveCount(3);
      const first = buttons.first();
      const s = await computed(first, ["display", "border-top-style", "border-top-width", "border-top-left-radius"]);
      expect(s.display).toBe("flex");
      expect(s["border-top-style"]).toBe("solid");
      expect(parseFloat(s["border-top-width"])).toBeGreaterThan(0);
      expect(parseFloat(s["border-top-left-radius"])).toBeGreaterThanOrEqual(8);
      await expect(first).toHaveAccessibleName(/^Library LangGraph$/);

      // Type chip, name and link icon sit on one row inside the box.
      const box = (await first.boundingBox())!;
      expect(box.height).toBeLessThan(80);
      const icon = (await first.locator("svg").boundingBox())!;
      expect(icon.x + icon.width).toBeGreaterThan(box.x + box.width - 40);

      // One box per row on phones, several per row on desktop.
      const second = (await buttons.nth(1).boundingBox())!;
      if (width < 768) expect(second.y).toBeGreaterThan(box.y + box.height - 1);
      else expect(Math.abs(second.y - box.y)).toBeLessThan(2);

      // Amber border on keyboard focus.
      await first.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect.poll(async () => (await computed(first, ["outline-style"]))["outline-style"]).toBe("solid");
      await expect.poll(async () => (await computed(first, ["border-top-color"]))["border-top-color"]).toBe("rgb(242, 169, 59)");

      await page.screenshot({ path: `tests/screens/output/tools-used-${width}.png`, fullPage: true });
    });

    test("toolkit and track stage pages have their styles", async ({ page }) => {
      await page.goto("/toolkit");
      const main = page.locator("main");
      const styled = await main.evaluate((m) =>
        [...m.querySelectorAll("a, button")].filter((el) => {
          const s = getComputedStyle(el);
          return s.borderTopStyle !== "none" || s.backgroundColor !== "rgba(0, 0, 0, 0)";
        }).length,
      );
      expect(styled).toBeGreaterThan(10);
      expect(await main.evaluate((m) => [...m.querySelectorAll("ul")].every((u) => getComputedStyle(u).listStyleType === "none" || u.closest("article")))).toBe(true);

      await page.goto("/tracks/gen-ai");
      const stage = page.locator('[id^="stage-"]').first();
      const st = await computed(stage, ["display", "border-top-style", "background-color"]);
      expect(st.display === "block" && st["border-top-style"] === "none" && st["background-color"] === "rgba(0, 0, 0, 0)").toBe(false);
      await page.screenshot({ path: `tests/screens/output/track-stage-${width}.png`, fullPage: false });
    });
  });
}
