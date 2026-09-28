import { expect, test } from "@playwright/test";

/** Posts with pictures, a video and jump links to their steps. */
test("post with images: step links, click to enlarge, video, toolkit link", async ({ page }) => {
  await page.goto("/blog/how-ai-actually-learns");

  await expect(page.getByRole("link", { name: "Teachable Machine", exact: true }).first()).toHaveAttribute(
    "href",
    "/toolkit/teachable",
  );
  const videos = page.locator("iframe");
  await expect(videos).toHaveCount(2);
  await expect(videos.first()).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/yd901VdqxPU/);
  await expect(videos.first()).toHaveAttribute("loading", "lazy");

  await page.getByRole("link", { name: "Step 5", exact: true }).click();
  await expect(page).toHaveURL(/#step-5$/);
  await expect(page.locator("#step-5")).toBeInViewport();

  // Images are resized by Next.js; enlarging shows the original.
  const open = page.getByRole("button", { name: /Enlarge image: Step 8/ });
  await expect(open.locator("img")).toHaveAttribute("src", /\/_next\/image/);
  await open.click();
  const full = page.locator("dialog[open] img");
  await expect(full).toHaveAttribute("src", "/blog/how-ai-actually-learns/step-8-prediction.webp");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
