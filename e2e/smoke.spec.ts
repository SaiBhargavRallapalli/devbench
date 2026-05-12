import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Workbench/i })).toBeVisible();
  });

  test("JSON workspace loads", async ({ page }) => {
    await page.goto("/json");
    await expect(page.getByRole("heading", { name: /JSON Toolkit/i })).toBeVisible();
  });

  test("Math Suite loads", async ({ page }) => {
    await page.goto("/graph-calculator");
    await expect(page.getByRole("heading", { name: /Math Suite/i })).toBeVisible();
  });

  test("PDF hub loads", async ({ page }) => {
    await page.goto("/pdf");
    await expect(page.getByRole("heading", { name: /PDF tools/i })).toBeVisible();
  });
});
