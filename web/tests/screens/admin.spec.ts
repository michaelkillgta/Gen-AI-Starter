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
    const error = page.locator("#admin-password-error");
    for (const left of [4, 3, 2, 1]) {
      await page.getByLabel("Password").fill(`wrong ${left}`);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(error).toContainText(`${left} ${left === 1 ? "try" : "tries"} left`);
    }
    // The fifth wrong try locks it.
    await page.getByLabel("Password").fill("wrong 0");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(error).toContainText("Too many wrong tries. Try again in 15 minutes.");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/Too many wrong tries/)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin: signed in", () => {
  test.use(asVisitor("203.0.113.13"));

  test("overview, a section with search, sorting and details, CSV and sign out", async ({ page, context }) => {
    // Someone joins the waitlist, so there's a row to find.
    await page.goto("/challenge");
    const phone = `8${String(Date.now()).slice(-9)}`;
    await page.getByLabel("Your name").fill("Admin Test Person");
    await page.getByLabel("WhatsApp number").fill(phone);
    await page.getByLabel("Email").fill(`admin+${phone}@example.com`);
    await page.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page).toHaveURL(/\/challenge\/joined/);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/admin/login");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
    await expect(page.getByText("Signed in")).toBeVisible();

    const cookie = (await context.cookies()).find((c) => c.name === "ft_admin");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Strict");
    expect(cookie?.path).toBe("/admin");

    // The side menu lists every section.
    const menu = page.getByRole("navigation", { name: "Admin sections" });
    for (const t of ["Overview", "Challenge waitlist", "Suggestions", "Weekly subscribers", "Contact messages"]) {
      await expect(menu.getByRole("link", { name: new RegExp(t) })).toBeVisible();
    }

    // Latest activity opens that entry's details in its section.
    await page.getByRole("link", { name: /Admin Test Person/ }).first().click();
    await expect(page).toHaveURL(/\/admin\/waitlist\?open=/);
    const details = page.getByRole("dialog");
    await expect(details.getByRole("heading", { name: "Admin Test Person" })).toBeVisible();
    await expect(details.getByRole("link", { name: `admin+${phone}@example.com` })).toHaveAttribute("href", `mailto:admin+${phone}@example.com`);
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();

    // Search and sort.
    await page.getByRole("searchbox").fill("Admin Test Person");
    await expect(page.getByRole("cell", { name: "Admin Test Person" })).toBeVisible();
    await page.getByRole("button", { name: /^Name/ }).click();
    await expect(page.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Download CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^field-tested-waitlist-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = fs.readFileSync((await download.path())!, "utf8");
    expect(csv).toContain("#,Name,WhatsApp,Email,Joined");
    expect(csv).toContain("Admin Test Person");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin/suggestions");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("works on a phone: tabs, cards, no sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    for (const path of ["/admin", "/admin/waitlist", "/admin/suggestions", "/admin/subscribers", "/admin/contacts"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBeLessThanOrEqual(0);
    }
  });
});

/**
 * Screenshots for Uma (docs/screens/admin/), only when asked: ADMIN_SCREENS=1.
 * Uses the throwaway test API and its test-only password, with made-up entries.
 */
test.describe("admin screenshots", () => {
  test.skip(!process.env.ADMIN_SCREENS, "Set ADMIN_SCREENS=1 to save admin screenshots");
  test.use(asVisitor("203.0.113.20"));

  test("save screenshots", async ({ page }) => {
    test.setTimeout(180_000);
    const people = [
      ["Asha Rao", "asha.rao@example.com"],
      ["Vikram Nair", "vikram.n@example.com"],
      ["Meera Iyer", "meera.iyer@example.com"],
    ];
    for (const [i, [name, email]] of people.entries()) {
      await page.goto("/challenge");
      await page.getByLabel("Your name").fill(name);
      await page.getByLabel("WhatsApp number").fill(`98765432${10 + i}`);
      await page.getByLabel("Email").fill(email);
      await page.getByRole("button", { name: "Join the waitlist" }).click();
      await expect(page).toHaveURL(/\/challenge\/joined/);
    }
    await page.goto("/suggest?about=weekly");
    await page.getByLabel("What should I judge?").fill("Marker for PDF parsing");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    await expect(page.getByText("Thank you! I read every suggestion.")).toBeVisible();
    await page.goto("/blog");
    await page.getByLabel("WhatsApp number or email").fill("reader@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/You're in/)).toBeVisible();
    await page.goto("/contact");
    await page.getByLabel("Your name").fill("Rohan Das");
    await page.getByLabel("Email").fill("rohan@example.com");
    await page.getByLabel("Message").fill("Can we run the build challenge at our college?");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/your message is in/)).toBeVisible();

    await page.goto("/admin/login");
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const dir = "../docs/screens/admin";
    for (const [w, h] of [[1440, 900], [768, 1024], [375, 812]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/admin");
      await page.screenshot({ path: `${dir}/overview-${w}.png`, fullPage: true });
      await page.goto("/admin/waitlist");
      await page.screenshot({ path: `${dir}/waitlist-${w}.png`, fullPage: true });
      await page.getByRole("row", { name: /Asha Rao/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.screenshot({ path: `${dir}/details-${w}.png` });
      await page.keyboard.press("Escape");
    }
  });
});
