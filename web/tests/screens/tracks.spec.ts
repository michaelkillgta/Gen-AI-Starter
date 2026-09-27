import { expect, test } from "@playwright/test";

/** The AI/ML track shows its big picture and each stage's mistakes and project check. */
test("AI/ML track: plan at a glance, roles, checks, mistakes", async ({ page }) => {
  await page.goto("/tracks/ai-ml");
  const plan = page.locator("section", { has: page.getByRole("heading", { name: "The plan at a glance" }) });
  await expect(plan.getByRole("heading", { level: 3 })).toHaveCount(7); // 5 phases + roles + checks
  await expect(plan.getByText("Machine learning engineer")).toBeVisible();
  await expect(plan.getByText("Beat a baseline")).toBeVisible();

  // Phase chips jump to their stage.
  await plan.getByRole("link", { name: /Test models honestly/ }).click();
  await expect(page).toHaveURL(/#stage-evaluate-honestly$/);

  const stage = page.locator("#stage-evaluate-honestly");
  await expect(stage.getByText("Stage 4 · 3 weeks · Core machine learning")).toBeVisible();
  await expect(stage.getByText("Common mistakes")).toBeVisible();
  await expect(stage.getByText("Reporting accuracy on imbalanced data")).toBeVisible();
  await expect(stage.getByText("How you'll know it works")).toBeVisible();
  await expect(stage.getByRole("link", { name: /Accuracy can lie/ })).toBeVisible();
});

test("Gen AI track has no overview yet and still renders", async ({ page }) => {
  await page.goto("/tracks/gen-ai");
  await expect(page.getByRole("heading", { name: "The plan at a glance" })).toHaveCount(0);
  await expect(page.locator("#stage-how-llms-work")).toBeVisible();
});
