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

  test("Notepad workspace loads editor chrome", async ({ page }) => {
    await page.goto("/notepad");
    await expect(page.getByRole("menubar")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "File" })).toBeVisible();
    await expect(page.getByText(/Ln 1, Col 1/)).toBeVisible({ timeout: 15_000 });
  });
});
