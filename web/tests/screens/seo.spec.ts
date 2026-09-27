import { expect, test } from "@playwright/test";

/** Search engines, feeds, share previews, errors and keyboard use. */
test.describe("seo and basics", () => {
  test("sitemap lists every kind of page", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/toolkit/docling", "/tracks/gen-ai/know-when-to-stop", "/tracks/ai-ml", "/weekly/1", "/blog/memory-is-not-truth", "/blog/category/agents", "/privacy"]) {
      expect(xml, path).toContain(path);
    }
    expect(xml.match(/<url>/g)?.length ?? 0).toBeGreaterThan(70);
  });

  test("robots and rss", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    const rss = await request.get("/rss.xml");
    expect(rss.headers()["content-type"]).toContain("application/rss+xml");
    const body = await rss.text();
    expect(body).toContain("<item>");
    expect(body).toContain("Worth It? Weekly, issue 1");
  });

  test("pages have titles, descriptions and share images", async ({ page, request }) => {
    await page.goto("/tracks/gen-ai/know-when-to-stop");
    await expect(page).toHaveTitle("Know when to stop · Field Tested");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /agents are built/);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toBeTruthy();
    const img = await request.get(new URL(og!).pathname);
    expect(img.status()).toBe(200);
    expect(img.headers()["content-type"]).toBe("image/png");
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld!)["@type"]).toBe("TechArticle");
  });

  test("unknown pages return 404", async ({ request }) => {
    for (const path of ["/nope", "/toolkit/nope", "/tracks/nope", "/tracks/gen-ai/nope", "/weekly/99", "/blog/nope", "/blog/category/nope"]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("wrong track in a deep dive address redirects to the right one", async ({ page }) => {
    // Old addresses from before the two-track plan still work.
    await page.goto("/tracks/agents-that-dont-break/know-when-to-stop");
    await expect(page).toHaveURL(/\/tracks\/gen-ai\/know-when-to-stop$/);
    await page.goto("/tracks/foundations");
    await expect(page).toHaveURL(/\/tracks\/ai-ml$/);
  });

  test("keyboard: skip link jumps to the content", async ({ page }) => {
    await page.goto("/toolkit");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
});
