import { expect, test } from "@playwright/test";

/** Every deep dive has real content, and its tools are links to the Toolkit. */
test.describe("deep dives", () => {
  test("every deep dive has a full body and a build step", async ({ request }) => {
    const tracks = await (await request.get("http://127.0.0.1:8090/tracks")).json();
    for (const t of tracks) {
      const track = await (await request.get(`http://127.0.0.1:8090/tracks/${t.slug}`)).json();
      for (const d of track.dives) {
        const dive = await (await request.get(`http://127.0.0.1:8090/dives/${d.slug}`)).json();
        expect(dive.body.length, d.slug).toBeGreaterThan(3);
        expect(dive.try_it, d.slug).toBeTruthy();
      }
    }
  });

  test("tools used are link buttons to the Toolkit", async ({ page }) => {
    await page.goto("/tracks/gen-ai/every-agent-needs-an-identity");
    await expect(page.getByText("being written")).toHaveCount(0);
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Tools used" }) });
    const link = section.getByRole("link", { name: /LangSmith/ });
    await expect(link).toHaveAttribute("href", "/toolkit/langsmith");
    await link.focus();
    await expect(link).toBeFocused();
    await link.click();
    await expect(page).toHaveURL(/\/toolkit\/langsmith$/);
  });
});
