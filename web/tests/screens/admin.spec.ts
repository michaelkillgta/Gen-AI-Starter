import fs from "node:fs";

import { expect, test } from "@playwright/test";

import { E2E_ADMIN_PASSWORD } from "../../playwright.config";

/**
 * The private admin area. Each test sends its own visitor IP so one test's
 * wrong passwords (and lockout) never affect another.
 */
const asVisitor = (ip: string) => ({ extraHTTPHeaders: { "x-forwarded-for": ip } });

test.describe("admin: signed out", () => {
  test.use(asVisitor("203.0.113.10"));

  test("is private: sign-in first, noindex, no data", async ({ page, request }) => {
    const res = await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect((await request.get("/admin/export/waitlist")).status()).toBe(401);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin");
  });
});

test.describe("admin: wrong password", () => {
  test.use(asVisitor("203.0.113.11"));

  test("is rejected with the tries left", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Password").fill("not the password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Wrong password. 4 tries left before a 15-minute lock.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin: lockout", () => {
  test.use(asVisitor("203.0.113.12"));

  test("5 wrong tries lock this visitor out, even with the right password", async ({ page }) => {
    await page.goto("/admin/login");
    for (let i = 0; i < 5; i++) {
      await page.getByLabel("Password").fill(`wrong ${i}`);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByRole("alert")).toBeVisible();
    }
    await expect(page.getByText(/Too many wrong tries/)).toBeVisible();
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/Too many wrong tries/)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin: signed in", () => {
  test.use(asVisitor("203.0.113.13"));

  test("dashboard, search, CSV and sign out", async ({ page, context }) => {
    // Someone joins the waitlist, so there's a row to find.
    await page.goto("/challenge");
    const phone = `8${String(Date.now()).slice(-9)}`;
    await page.getByLabel("Your name").fill("Admin Test Person");
    await page.getByLabel("WhatsApp number").fill(phone);
    await page.getByLabel("Email").fill(`admin+${phone}@example.com`);
    await page.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page).toHaveURL(/\/challenge\/joined/);

    await page.goto("/admin/login");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign-ups and messages");

    const cookie = (await context.cookies()).find((c) => c.name === "ft_admin");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Strict");
    expect(cookie?.path).toBe("/admin");

    for (const t of ["Challenge waitlist", "Suggestions", "Weekly subscribers", "Contact messages"]) {
      await expect(page.getByRole("heading", { level: 2, name: new RegExp(t) })).toBeVisible();
    }
    const waitlist = page.locator("#waitlist");
    await waitlist.getByRole("searchbox").fill("Admin Test Person");
    await expect(waitlist.getByRole("cell", { name: "Admin Test Person" })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      waitlist.getByRole("link", { name: "Download CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^field-tested-waitlist-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = fs.readFileSync((await download.path())!, "utf8");
    expect(csv).toContain("#,Name,WhatsApp,Email,Joined");
    expect(csv).toContain("Admin Test Person");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("works on a phone without sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});
