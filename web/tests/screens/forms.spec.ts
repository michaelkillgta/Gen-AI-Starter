import { expect, test } from "@playwright/test";

/** The forms work end to end: browser → Next server action → Rust API → file store. */
test.describe("forms", () => {
  test("waitlist: errors, then success with a place number", async ({ page }) => {
    await page.goto("/challenge");
    const counter = page.getByText(/of 50/).first();
    const before = Number((await counter.textContent())?.match(/(\d+) of 50/)?.[1] ?? 0);

    await page.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();

    const phone = `9${String(Date.now()).slice(-9)}`;
    await page.getByLabel("Your name").fill("Test Student");
    await page.getByLabel("WhatsApp number").fill(phone);
    await page.getByLabel("Email").fill(`test+${phone}@example.com`);
    await page.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(page).toHaveURL(/\/challenge\/joined\?n=\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're on the list.");
    await expect(page.getByText(new RegExp(`${before + 1} of 50`))).toBeVisible();
  });

  test("blog subscribe", async ({ page }) => {
    await page.goto("/blog");
    await page.getByLabel("WhatsApp number or email").fill("not a contact");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/Enter a WhatsApp number/)).toBeVisible();
    await page.getByLabel("WhatsApp number or email").fill("reader@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/You're in/)).toBeVisible();
  });

  test("suggest and contact", async ({ page }) => {
    await page.goto("/suggest?about=weekly");
    await expect(page.getByLabel(/Something to judge in Weekly/)).toBeChecked();
    await page.getByLabel("What should I judge?").fill("Docling");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    await expect(page.getByText("Thank you! I read every suggestion.")).toBeVisible();

    await page.goto("/contact");
    await page.getByLabel("Your name").fill("Asha");
    await page.getByLabel("Email").fill("asha@college.edu");
    await page.getByLabel("Message").fill("Can we run the build challenge at our college?");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/your message is in/)).toBeVisible();
  });

  test("progress is remembered: deep dives and stages", async ({ page }) => {
    await page.goto("/tracks/gen-ai/know-when-to-stop");
    await page.getByRole("button", { name: "Mark as done" }).click();
    await expect(page.getByRole("button", { name: /Done ✓/ })).toBeVisible();

    await page.goto("/tracks/gen-ai");
    await expect(page.getByText("0 of 9 stages done").first()).toBeVisible();
    const stage = page.locator("#stage-how-llms-work");
    await stage.getByRole("checkbox").first().check();
    await stage.getByRole("button", { name: "Mark this stage done" }).click();
    await expect(page.getByText("1 of 9 stages done").first()).toBeVisible();
    await page.reload();
    await expect(page.getByText("1 of 9 stages done").first()).toBeVisible();
    await expect(page.locator("#stage-how-llms-work").getByRole("checkbox").first()).toBeChecked();
  });
});
