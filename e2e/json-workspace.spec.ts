import { expect, test } from "@playwright/test";

test.describe("JSON workspace", () => {
  test("?json= bootstraps inline JSON", async ({ page }) => {
    await page.goto("/json?json=%7B%22hello%22%3A%22world%22%7D");
    await expect(page.getByRole("heading", { name: /JSON Toolkit/i })).toBeVisible();
    const textarea = page.locator("textarea").first();
    await expect(textarea).toHaveValue(/"hello"/);
    await expect(page.getByText(/Valid JSON/i)).toBeVisible({ timeout: 5000 });
  });

  test("Fix JSON repairs trailing comma", async ({ page }) => {
    await page.goto("/json/repair");
    await expect(page.getByRole("heading", { name: /JSON Toolkit/i })).toBeVisible();
    const textarea = page.locator("textarea").first();
    await textarea.fill('{"a": 1,}');
    await page.getByRole("button", { name: /^Fix$/i }).click();
    await expect(page.getByText(/JSON is valid now/i)).toBeVisible({ timeout: 8000 });
    await expect(textarea).toHaveValue(/"a": 1/);
    await expect(textarea).not.toHaveValue(/,\s*\}/);
  });

  test("repair example chip loads broken JSON", async ({ page }) => {
    await page.goto("/json/repair");
    await page.getByRole("button", { name: "Trailing commas" }).click();
    const textarea = page.locator("textarea").first();
    await expect(textarea).toHaveValue(/\{/);
    await expect(textarea).toHaveValue(/,\s*\}/);
  });

  test("JSONPath tab is default on /json/path", async ({ page }) => {
    await page.goto("/json/path");
    await expect(page.getByRole("tab", { name: /JSONPath/i })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/JSONPath Query/i)).toBeVisible();
  });
});
